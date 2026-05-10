<p align="center">
  <a href="#" target="blank"><img src="https://res.cloudinary.com/dp6urj3gj/image/upload/v1731674488/car_logo_tst97o.png" width="160" alt="Chaka Ride Logo" /></a>
</p>

<p align="center">A professional and scalable ride-sharing platform backend with role-based access, trip management, and AI-powered smart estimates.</p>

# CHAKA RIDE SERVER

**CHAKA RIDE SERVER** is a full-featured backend API for a modern ride-sharing and car rental platform. It supports passenger and driver onboarding, trip requesting and bidding flows, admin moderation, and AI-powered recommendations.

---

## 🚀 Features

### Role Based Authorization

[PASSENGER, DRIVER, ADMIN, SUPER_ADMIN]

### Authentication and Account Security

- **Better-Auth integration** with session management.
- **Role and status aware access control** for secure routing.

### Trip Management

- **Create Trip Request** (PASSENGER, ADMIN)
- **Driver Bidding System** (DRIVER)
- **Approve/Reject Bids** (ADMIN)
- **Trip Status Workflow** (PENDING, ASSIGNED, COMPLETED, CANCELLED)
- Support for One-Way, Round-Trip, and various car categories.

### Profile Management

- **Passenger Profile** and preferences.
- **Driver Profile** with vehicle registration and license verification.
- **Admin Profile** for operational control.

### AI Features

- **Smart Trip Assistant:** AI-powered vehicle recommendations based on passenger requirements (distance, passengers, luggage).
- **Smart Bidding/Price Estimation:** AI-generated fair market price estimates for drivers bidding on trips, analyzing distance, route, and car category.

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
- **Prisma** - Next-generation ORM

### Authentication and Security

- **Better-Auth** - Session and identity handling
- **Role Guards** for protected APIs

### AI Integration

- **OpenRouter (OpenAI Models)** for intelligent recommendations and pricing.

---

## 📋 Prerequisites

Before setup, ensure you have:

- **Node.js** (v18+ recommended)
- **pnpm** (or npm)
- **PostgreSQL** database
- **Git**

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/mazharul90007/chaka_ride.git
cd chaka_ride/chaka_ride_server
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

## 👤 Author

Mazharul Islam Sourabh

---

## 📝 License

ISC
