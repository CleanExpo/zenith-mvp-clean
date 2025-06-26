# Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository called `zenith-mvp-clean`
3. Make it public or private as you prefer
4. Don't initialize with README (we already have one)

## Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/zenith-mvp-clean.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import the `zenith-mvp-clean` repository
3. Use these settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install

4. Click Deploy

## Expected Result

The deployment should succeed with:
- A working homepage at https://your-app.vercel.app
- A working API endpoint at https://your-app.vercel.app/api/health

## What's Next?

Once this minimal deployment works, we'll:
1. Add a simple website analyzer (no database)
2. Test the deployment
3. Add database if needed
4. Continue building features incrementally