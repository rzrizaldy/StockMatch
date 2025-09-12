# Overview

StockMatch is a gamified stock discovery and portfolio creation tool designed for new investors aged 18-30. The application transforms complex stock screening into a simple, Tinder-like swiping experience where users can build a personalized stock portfolio in under 30 seconds. Users complete a quick personalization quiz, swipe right on companies they like, and receive an automatically generated portfolio with data visualizations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built as a React Single Page Application (SPA) using:

- **React 18** with TypeScript for type safety and component-based UI
- **Wouter** as a lightweight client-side router instead of React Router
- **Tailwind CSS** with shadcn/ui components for consistent, responsive design
- **TanStack Query** for server state management and API caching
- **Recharts** for portfolio visualization with pie charts
- **Vite** as the build tool and development server

The UI follows a mobile-first design pattern with four main screens: Home (landing), Quiz (personalization), Swipe (stock selection), and Portfolio (results). The app uses a swipe-based interaction model similar to dating apps, making stock selection intuitive for the target demographic.

## Backend Architecture

The server is an Express.js application with TypeScript that provides:

- **RESTful API endpoints** for user profiles, stock data, and portfolio management
- **In-memory storage** implementation for the MVP (easily replaceable with database)
- **Curated stock database** with 24 major companies across technology, healthcare, finance, consumer goods, and energy sectors
- **Session-based user tracking** using generated session IDs stored in browser sessionStorage

The backend follows a clean separation with dedicated modules for routes, storage abstraction, and business logic.

## Data Storage Solutions

Currently uses an in-memory storage system with interfaces designed for easy migration to persistent storage:

- **User Profiles**: Risk tolerance, industry preferences, ESG preferences
- **Stock Cards**: Company data including ticker, name, industry, metrics, and marketing copy
- **Portfolios**: User session mapping to liked stocks and calculated values
- **Database Schema**: Defined using Drizzle ORM with PostgreSQL dialect for future migration

## Authentication and Authorization

The MVP uses a simplified session-based approach:

- **Session Generation**: Creates unique session IDs using timestamp and random strings
- **Session Persistence**: Stores session IDs in browser sessionStorage
- **No User Accounts**: Anonymous usage pattern for rapid onboarding
- **Stateless Design**: Each session is independent with no cross-session data sharing

## External Dependencies

- **Neon Database**: PostgreSQL-compatible serverless database (configured via Drizzle but not currently active)
- **Drizzle ORM**: Database toolkit for schema definition and migrations
- **Radix UI**: Headless component library for accessibility and consistent behavior
- **Lucide React**: Icon library for consistent iconography throughout the app
- **Recharts**: Chart library for portfolio data visualization

The architecture prioritizes rapid development and easy deployment while maintaining clear separation of concerns and type safety throughout the stack.