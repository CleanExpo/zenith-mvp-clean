# Quick Deployment Guide

## The Issue
Vercel can't find the Next.js dependency because the code isn't pushed to GitHub yet.

## Quick Fix (5 minutes)

### 1. Create the project locally

```bash
# Clone your repository
git clone https://github.com/CleanExpo/zenith-mvp-clean.git
cd zenith-mvp-clean

# Create package.json
cat > package.json << 'EOF'
{
  "name": "zenith-mvp",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.2.3",
    "typescript": "^5.0.0"
  }
}
EOF

# Create app directory structure
mkdir -p app/api/health

# Create app/layout.tsx
cat > app/layout.tsx << 'EOF'
import './globals.css'

export const metadata = {
  title: 'Zenith MVP',
  description: 'Minimal Viable Product for Zenith Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

# Create app/page.tsx
cat > app/page.tsx << 'EOF'
export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Zenith MVP</h1>
      <p>Welcome to the Zenith Minimal Viable Product</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Status</h2>
        <ul>
          <li>✅ Next.js App Running</li>
          <li>✅ TypeScript Configured</li>
          <li>✅ API Route Available</li>
        </ul>
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>Test API</h2>
        <p>
          <a href="/api/health" style={{ color: 'blue', textDecoration: 'underline' }}>
            Check Health Endpoint
          </a>
        </p>
      </section>
    </main>
  )
}
EOF

# Create app/globals.css
cat > app/globals.css << 'EOF'
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
}

body {
  color: rgb(0, 0, 0);
  background: rgb(255, 255, 255);
}

a {
  color: inherit;
  text-decoration: none;
}

@media (prefers-color-scheme: dark) {
  body {
    color: rgb(255, 255, 255);
    background: rgb(0, 0, 0);
  }
}
EOF

# Create app/api/health/route.ts
cat > app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    message: 'Zenith MVP API is running'
  })
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
EOF

# Install dependencies and test
npm install
npm run build

# If build succeeds, push to GitHub
git add .
git commit -m "feat: Initial MVP deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import `CleanExpo/zenith-mvp-clean`
3. Use default Next.js settings
4. Click Deploy

### 3. Expected Result

- **Homepage**: Working at your Vercel URL
- **API**: `https://your-app.vercel.app/api/health` returns JSON

## Why This Will Work

- **Minimal dependencies**: Only Next.js, React, TypeScript
- **No complex configurations**: Standard Next.js setup
- **No external services**: No database, no Redis, no auth
- **Clean build**: Tested locally first

## Next Steps

Once this deploys successfully:
1. Add basic website analyzer functionality
2. Test deployment again
3. Add database (if needed)
4. Continue building features incrementally