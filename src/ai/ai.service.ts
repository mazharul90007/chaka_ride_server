import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CarService } from '../car/car.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private carService: CarService,
    private prisma: PrismaService,
  ) {
    
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000', // Optional, for OpenRouter analytics
        'X-Title': 'Chaka Ride', // Optional, for OpenRouter analytics
      },
    });
  }

  async recommendVehicle(tripDetails: {
    pickup: string;
    destination: string;
    passengers: number;
    purpose?: string;
    specialRequirements?: string;
  }) {
    const categories = await this.carService.getAllCategories();
    
    const categoriesContext = categories.map(cat => ({
      id: cat.id,
      name: cat.categoryName,
      seats: cat.seat,
      luggage: cat.luggage,
      description: cat.description,
    }));

    const prompt = `
      You are Chaka Ride's intelligent vehicle consultant. 
      Based on the following trip details, suggest the best vehicle category from our fleet.
      
      Trip Details:
      - Pickup: ${tripDetails.pickup}
      - Destination: ${tripDetails.destination}
      - Passengers: ${tripDetails.passengers}
      - Purpose: ${tripDetails.purpose || 'General Travel'}
      - Special Requirements: ${tripDetails.specialRequirements || 'None'}

      Available Fleet Categories:
      ${JSON.stringify(categoriesContext, null, 2)}

      Response Format:
      Provide a helpful, friendly response in JSON format:
      {
        "suggestedCategoryId": "id_of_the_category",
        "suggestedCategoryName": "name_of_the_category",
        "explanation": "Why this is the best choice (1-2 sentences)",
        "alternativeSuggestion": "Optional secondary choice id",
        "alternativeExplanation": "Optional secondary choice explanation"
      }
    `;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENROUTER_LLM_MODEL') || 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful travel assistant for Chaka Ride. Always respond in valid JSON.' },
        { role: 'user', content: prompt }
      ],
    });

    console.log('Raw AI Response:', response.choices[0].message.content);

    let content = response.choices[0].message.content ?? '';
    
    // Clean up markdown code blocks if present
    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
      return {
        error: "Failed to parse AI response",
        raw: content
      };
    }
  }

  async estimateTripPrice(tripDetails: {
    pickup: string;
    destination: string;
    carCategoryName: string;
    tripType: string;
  }) {
    const prompt = `
      You are Chaka Ride's expert financial analyst for ride-sharing and car rentals in Bangladesh.
      Based on the following trip details, provide a fair market price estimate for the driver to bid.
      
      Trip Details:
      - Pickup Location: ${tripDetails.pickup}
      - Destination: ${tripDetails.destination}
      - Car Category: ${tripDetails.carCategoryName}
      - Trip Type: ${tripDetails.tripType}

      Guidelines:
      1. Prices must be in BDT (৳).
      2. Factor in typical distances between these locations in Bangladesh, tolls, and fuel costs.
      3. Factor in the car category (e.g., Premium cars cost more than Economy).
      4. If it is a ROUND_TRIP, the price should be roughly double a ONE_WAY trip, plus waiting time.
      5. Provide a realistic number. Do not say "it depends". Give your best professional estimate.

      Response Format:
      Provide a helpful, friendly response in JSON format exactly like this:
      {
        "estimatedPrice": 5500,
        "reasoning": "A brief 1-2 sentence explanation of how you calculated this (e.g., 'The distance from Dhaka to Sylhet is approx 240km. For a premium sedan, 5500 BDT covers fuel and standard market rates.')"
      }
    `;

    const response = await this.openai.chat.completions.create({
      model: this.configService.get<string>('OPENROUTER_LLM_MODEL') || 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert financial pricing assistant for a ride-sharing app in Bangladesh. Always respond in valid JSON matching the requested schema.' },
        { role: 'user', content: prompt }
      ],
    });

    let content = response.choices[0].message.content ?? '';
    
    // Clean up markdown code blocks if present
    if (content.includes('```')) {
      content = content.replace(/```json|```/g, '').trim();
    }

    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
      return {
        error: "Failed to parse AI response",
        raw: content
      };
    }
  }

  async suggestDrivers(tripDetails: {
    pickup: string;
    destination: string;
    carCategoryId: string;
    tripType: string;
  }) {
    // 1. Fetch all approved drivers with their details
    const drivers = await this.prisma.driver.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { name: true, email: true } },
        vehicleCategory: { select: { categoryName: true } },
      },
    });

    const category = await this.prisma.carCategory.findUnique({
      where: { id: tripDetails.carCategoryId },
    });

    if (drivers.length === 0) {
      return { recommendations: [] };
    }

    // 2. Prepare context for AI
    const driversContext = drivers.map(d => ({
      id: d.id,
      name: d.user.name,
      vehicle: d.vehicleModel,
      vehicleType: d.vehicleCategory?.categoryName,
      license: d.licenseNumber ? "Verified" : "Pending",
    }));

    const prompt = `
      You are Chaka Ride's expert dispatch AI. Your goal is to suggest the Top 5 best drivers for a new trip.
      
      Trip Requirements:
      - Route: ${tripDetails.pickup} to ${tripDetails.destination}
      - Car Type Required: ${category?.categoryName || 'Any'}
      - Trip Type: ${tripDetails.tripType}

      Available Approved Drivers:
      ${JSON.stringify(driversContext, null, 2)}

      Selection Criteria:
      1. Priority given to drivers whose vehicle type matches the required category.
      2. If a driver seems like a perfect match for the route, prioritize them.
      
      Response Format (Strict JSON):
      {
        "recommendations": [
          {
            "driverId": "id",
            "driverName": "name",
            "matchScore": 95, // 0-100
            "reasoning": "Brief explanation (1 sentence)"
          }
        ]
      }
      
      Suggest exactly 5 drivers. If there are fewer than 5, suggest all available.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENROUTER_LLM_MODEL') || 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: 'You are a professional dispatch assistant. Always respond in valid JSON.' },
          { role: 'user', content: prompt }
        ],
      });

      let content = response.choices[0].message.content ?? '';
      if (content.includes('```')) {
        content = content.replace(/```json|```/g, '').trim();
      }

      return JSON.parse(content);
    } catch (e) {
      console.error('AI Suggestion Error:', e);
      throw e;
    }
  }

  async getMorningBriefing() {
    // 1. Fetch current stats
    const [totalDrivers, totalPassengers, totalTrips, pendingDrivers, pendingQueries] = 
      await Promise.all([
        this.prisma.driver.count(),
        this.prisma.passenger.count(),
        this.prisma.trip.count(),
        this.prisma.driver.count({ where: { status: 'PENDING' } }),
        this.prisma.query.count({ where: { status: 'PENDING' } }),
      ]);

    // 2. Fetch recent trip routes for context
    const recentTrips = await this.prisma.trip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { pickupLocation: true, destination: true }
    });

    const context = {
      totalDrivers,
      totalPassengers,
      totalTrips,
      pendingVerifications: pendingDrivers,
      unreadQueries: pendingQueries,
      recentRoutes: recentTrips.map(t => `${t.pickupLocation} to ${t.destination}`),
      date: new Date().toLocaleDateString(),
    };

    const prompt = `
      You are Chaka Ride's senior platform manager. Provide a concise, professional, and encouraging "Morning Briefing" for the Admin.
      
      Platform Stats:
      ${JSON.stringify(context, null, 2)}

      Requirements:
      1. Keep it to 2-3 sentences.
      2. Mention at least one specific stat (e.g., pending drivers or unread queries).
      3. Use a friendly "Good morning" tone.
      4. Highlight a recent route if available.
      
      Response Format:
      Return ONLY a JSON object: { "briefing": "The briefing text here..." }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>('OPENROUTER_LLM_MODEL') || 'google/gemini-2.0-flash-exp:free',
        messages: [
          { role: 'system', content: 'You are a helpful admin assistant. Always respond in valid JSON.' },
          { role: 'user', content: prompt }
        ],
      });

      let content = response.choices[0].message.content ?? '';
      if (content.includes('```')) {
        content = content.replace(/```json|```/g, '').trim();
      }

      const parsed = JSON.parse(content);
      return { briefing: parsed.briefing || parsed.message || content };
    } catch (e) {
      console.error('AI Briefing Error:', e);
      return { briefing: "Good morning! The platform is running smoothly. Check your pending tasks to stay ahead." };
    }
  }
}
