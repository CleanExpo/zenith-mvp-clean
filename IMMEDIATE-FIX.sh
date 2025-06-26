#!/bin/bash

# IMMEDIATE FIX for Zenith MVP Deployment
# Copy and paste this entire script into your terminal

echo "🚀 Creating Zenith MVP with working deployment..."

# Create the complete project structure
mkdir -p zenith-mvp-working
cd zenith-mvp-working

# Initialize git
git init
git branch -m main

# Create package.json with Next.js dependency
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

# Create directory structure
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
      <h1>🚀 Zenith MVP</h1>
      <p>Minimal Viable Product - Successfully Deployed!</p>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>✅ Status</h2>
        <ul>
          <li>✅ Next.js 14 Running</li>
          <li>✅ TypeScript Configured</li>
          <li>✅ API Route Working</li>
          <li>✅ Vercel Deployment Success</li>
        </ul>
      </section>
      
      <section style={{ marginTop: '2rem' }}>
        <h2>🔗 Test API</h2>
        <p>
          <a href="/api/health" style={{ color: 'blue', textDecoration: 'underline' }}>
            Check Health Endpoint →
          </a>
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>🎯 Next Steps</h2>
        <ol>
          <li>✅ Basic deployment working</li>
          <li>🔄 Add website analyzer functionality</li>
          <li>🔄 Add database integration</li>
          <li>🔄 Add authentication</li>
        </ol>
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
  font-family: system-ui, -apple-system, sans-serif;
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

main {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

ul, ol {
  margin-left: 2rem;
}

li {
  margin-bottom: 0.5rem;
}

a {
  color: #0070f3;
  text-decoration: underline;
}

a:hover {
  color: #0051cc;
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
    message: 'Zenith MVP API is running successfully!',
    deployment: 'vercel',
    framework: 'Next.js 14',
    ready: true
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

# Create .gitignore
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

# Create README.md
cat > README.md << 'EOF'
# Zenith MVP

Minimal viable product for Zenith Platform with working Vercel deployment.

## Status

✅ **DEPLOYED** - Working Next.js application with API

## Features

- Next.js 14 with TypeScript
- Health check API endpoint
- Responsive design
- Dark mode support
- Zero external dependencies

## Local Development

```bash
npm install
npm run dev
```

## Deployment

Automatically deploys to Vercel on push to main branch.

## API Endpoints

- `GET /api/health` - Health check endpoint

## Next Features to Add

1. Website analyzer functionality
2. Database integration
3. User authentication
4. Advanced features
EOF

echo "📁 Project structure created successfully!"
echo ""
echo "🔧 Installing dependencies..."
npm install

echo ""
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "📤 Now push to GitHub:"
    echo "1. git remote add origin https://github.com/CleanExpo/zenith-mvp-clean.git"
    echo "2. git add ."
    echo "3. git commit -m 'feat: Working MVP with Next.js and API'"
    echo "4. git push -u origin main"
    echo ""
    echo "🚀 Then deploy to Vercel - it will work!"
else
    echo "❌ Build failed. Check the errors above."
fi