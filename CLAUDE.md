# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `pnpm dev` - Start development server on port 6645
- `pnpm build` - Build production application
- `pnpm start` - Start production server on port 6645
- `pnpm lint` - Run ESLint for code quality checks

### Database Operations
- `pnpm db:view` - Open Prisma Studio for database management

### Production Deployment (PM2)
- `pnpm pm2` - Start application with PM2
- `pnpm pm2:stop` - Stop PM2 processes  
- `pnpm pm2:logs` - View PM2 logs

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Jotai for client state
- **Data Fetching**: SWR and TanStack Query
- **UI Components**: Custom components with Radix UI primitives
- **Image Handling**: Masonic grid layout with photo viewer

### Database Schema
The application manages three main entities:
- **Images**: Core image data with metadata (platform, author, dimensions, tags)
- **ImageTags**: Tag associations for images
- **Stash**: Temporary storage for processing

### Application Structure

#### Core Features
- **Image Gallery**: Masonic grid layout with infinite scroll and pagination modes
- **Artist Pages**: Individual artist profiles with their artwork collections
- **Tag System**: Categorization and filtering by tags
- **Search**: Image and artist search functionality
- **RSS Feed**: Auto-generated XML feed at `/feed.xml`

#### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components organized by type
- `src/lib/` - Core business logic and database services
- `src/hooks/` - Custom React hooks
- `src/store/` - Jotai state management
- `src/constants/` - Configuration and constants

#### Data Flow
- API routes in `src/app/api/` handle server-side operations
- `imageService.ts` contains core database queries with Prisma
- Components use SWR/TanStack Query for client-side data fetching
- Superjson handles serialization of complex data types (BigInt, Date)

### State Management Patterns
- **Global State**: Jotai atoms for pagination, view mode, and menu state
- **Server State**: SWR for caching and synchronization
- **Theme**: next-themes for dark/light mode

### Custom Configuration
- **Ports**: Development and production run on port 6645
- **Images**: Unoptimized with wildcard remote patterns
- **MDX**: Integrated for static pages (about, friends)
- **Rewrites**: RSS feed accessible at multiple paths (/rss, /feed, /feed.xml)

### Performance Considerations
- Prisma connection pooling with development caching
- Masonic virtualized grid for large image collections
- Image lazy loading and optimization
- Infinite scroll with pagination fallback

### Styling System
- Tailwind with custom color variables and design tokens
- CSS custom properties for theme switching
- Responsive breakpoints with mobile-first approach
- Typography plugin for MDX content

## Important Notes
- Database operations use BigInt for IDs - ensure proper serialization
- Image URLs support wildcard domains for flexibility
- Production includes analytics script integration
- PM2 configuration available for production deployment