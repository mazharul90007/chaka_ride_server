<p align="center">
  <a href="#" target="blank"><img src="https://res.cloudinary.com/dp6urj3gj/image/upload/v1731674488/car_logo_tst97o.png" width="160" alt="Chaka Ride Logo" /></a>
</p>

<p align="center">A professional and scalable ride-sharing platform backend with role-based access, trip management, and AI-powered smart estimates.</p>

# CHAKA RIDE SERVER

**CHAKA RIDE SERVER** is a full-featured backend API for a modern ride-sharing and car rental platform. It supports passenger and driver onboarding, trip requesting and bidding flows, admin moderation, and AI-powered recommendations.

🌐 **Frontend Live URL:** [https://chaka-ride-client.vercel.app](https://chaka-ride-client.vercel.app)  
🌐 **Backend Live URL:** [https://chaka-ride-server.onrender.com](https://chaka-ride-server.onrender.com)  
🌐 **Frontend Github URL:** [https://github.com/mazharul90007/chaka_ride](https://github.com/mazharul90007/chaka_ride)  

---

## 🚀 Features

### Role Based Authorization

[PASSENGER, DRIVER, ADMIN, SUPER_ADMIN]

### Authentication and Account Security

- **Better-Auth integration** with cookie-based sessions.
- **Social Login**: Support for **Google Login** via Better-Auth.
- **Role and status aware access control** for secure routing.

### Trip Management

- **Create Trip Request** (PASSENGER, ADMIN)
- **Driver Bidding System** (DRIVER)
- **Approve/Reject Bids** (ADMIN)
- **Get All Trips** (ADMIN)
- Support for One-Way, Round-Trip, and various car categories.

### Profile Management

- **Passenger Profile** and preferences.
- **Driver Profile** with vehicle registration and license verification.
- **Admin Profile** for operational control.

### Admin Control Panel APIs

- Manage passengers, drivers, and admin profiles.
- Manage vehicle categories.
- Track platform revenue and driver earnings.
- Manage passenger support queries.

---

## 🛠 Technology Stack

### Backend Framework

- **Node.js** - Runtime environment
- **NestJS** - Web framework
- **TypeScript** - Type-safe JavaScript development

### Database and ORM

- **PostgreSQL**
- **Prisma** with modular schema files

### Authentication and Security

- **Better-Auth** - Session and identity handling
- **Role Guards** for protected APIs
- **Zod / Class Validator** - Request payload validation

### Storage and Integrations

- **Cloudinary** - Profile assets and car images
- **OpenRouter** - AI integrations

---

## 📋 Prerequisites

Before setup, ensure you have:

- **Node.js** (v18+ recommended)
- **pnpm** (or npm)
- **PostgreSQL** database
- **Cloudinary account** (for media upload)
- **OpenRouter account** (for AI)
- **Git**

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mazharul90007/chaka_ride_server.git
cd chaka_ride_server
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

Create `.env` at the project root and set:

```env
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/chakaride"

BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:4000"
APP_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

OPENROUTER_API_KEY="your_openrouter_api_key"
OPENROUTER_LLM_MODEL="openai/gpt-3.5-turbo"
```

### 4. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Server

Development:

```bash
pnpm run start:dev
```

Build:

```bash
pnpm run build
```

Server default URL: `http://localhost:4000`

---

## 🎯 Usage Notes

- Base REST prefix: `/api/v1`
- Better-Auth base prefix: `/api/v1/auth/*`
- Most protected endpoints require authentication cookie/session plus role checks.

---

## 🛣️ API Endpoints

All endpoints below are relative to your server URL.

### 🔐 Better-Auth Core (`/api/v1/auth/*`)

- `ALL /api/v1/auth/*`
This includes built-in auth routes (for example sign-in, sign-up, sign-out, session) managed by Better-Auth.

---

### 👤 Users & Profiles (`/api/v1/user`, `/api/v1/driver`, `/api/v1/passenger`)

- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update profile
- `GET /driver/profile` - Get driver specifics
- `POST /driver/profile` - Update driver specifics

---

### 🚗 Car Categories & Fleet (`/api/v1/car`)

- `POST /category` - Create car category (ADMIN)
- `GET /categories` - List categories
- `GET /all` - List all vehicles
- `POST /` - Add a vehicle

---

### 🗺️ Trips & Bidding (`/api/v1/trip`)

- `POST /` - Create a trip request (PASSENGER, ADMIN)
- `GET /admin` - List all trips with pagination (ADMIN)
- `PATCH /:id/approve-driver/:requestId` - Approve a driver's bid (ADMIN)
- `PATCH /:id/reject-bid/:requestId` - Reject a driver's bid (ADMIN)
- `GET /driver` - List trips and requests for a specific driver (DRIVER)
- `PATCH /request/:requestId/respond` - Submit a bid / Accept trip (DRIVER)
- `GET /passenger` - List trips for a passenger (PASSENGER)

---

### 💬 Queries (`/api/v1/query`)

- `POST /create` - Submit a support query (PASSENGER)
- `GET /my-queries` - List passenger's own queries (PASSENGER)
- `GET /all` - List all queries (ADMIN)

---

### 🤖 AI Services (`/api/v1/ai`)

- `POST /recommend` - Recommend a vehicle based on trip details (PUBLIC)
- `POST /estimate-price` - Generate a smart price estimate for a bid (DRIVER)

---

## 🤖 AI Features

Chaka Ride leverages AI to provide a smarter booking and operational experience:

- **Smart Trip Assistant**: AI-powered natural language logic to recommend the perfect vehicle based on passenger count, luggage, and destination.
- **Smart Bidding System**: Instant AI price calculations to help drivers formulate competitive bids based on market rates and distance.

---

## 📖 Data Model Overview

Core entities in this project:

- **User/Auth**: `User`, `Session`, `Account`
- **Profiles**: `Passenger`, `Driver`, `Admin`
- **Fleet**: `CarCategory`, `Vehicle`
- **Trips**: `Trip`, `TripRequest`
- **Support**: `Query`

---

## 📝 License

ISC

---

## 👤 Author

Mazharul Islam Sourabh

---

## 🤝 Contributing

Feel free to fork the project and submit pull requests. For major changes, open an issue first so implementation scope can be discussed.

---

## 📞 Support

For support, contact the project maintainer or create an issue in the repository.
