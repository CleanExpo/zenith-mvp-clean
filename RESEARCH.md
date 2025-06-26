# SaaS Platform Research & Commands

## Current MVP Status ✅
- Next.js 14.2.3 + TypeScript
- Build: SUCCESS (87.1 kB first load)
- Deployment: Vercel (prj_6G73YS9fXoVmNuDFJqBMCgcIuQef)
- API: /api/health working

## Research Required

### 1. Supabase Integration
**Need to research:**
- Latest Supabase JS client version
- Auth setup with Next.js 14 App Router
- Database schema design for SaaS
- Row Level Security patterns
- Environment variables setup

### 2. shadcn/ui Components
**Need to research:**
- Installation with Next.js 14 + TypeScript
- Required base components for SaaS dashboard
- Theme configuration
- Component dependencies

### 3. Stripe Integration
**Need to research:**
- Latest Stripe JS version
- Next.js 14 webhook setup
- Subscription management patterns
- Test mode configuration

### 4. Redis Caching
**Need to research:**
- Redis client options for Next.js
- Connection pooling setup
- Session storage patterns
- Environment configuration

### 5. Production Tools
**Need to research:**
- Sentry error monitoring setup
- Environment variable management
- Performance monitoring tools
- Security best practices

## Installation Commands (TO BE RESEARCHED)

```bash
# Supabase (need exact versions)
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# shadcn/ui (need exact commands)
npx shadcn-ui@latest init

# Stripe (need exact versions)
npm install stripe @stripe/stripe-js

# Redis (need exact versions)
npm install ioredis @types/ioredis

# Additional tools (need exact versions)
npm install @sentry/nextjs zod react-hook-form
```

## Next Steps
1. Use Context7 to research each library
2. Get EXACT installation commands
3. Verify compatibility with Next.js 14.2.3
4. Create incremental deployment plan