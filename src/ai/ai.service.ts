import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CarService } from '../car/car.service';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private carService: CarService,
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
}
