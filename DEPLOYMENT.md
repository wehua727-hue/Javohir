# Deployment Guide

## Vercel Deployment

This project is configured for deployment to Vercel. Follow these steps:

### Prerequisites
1. Node.js installed
2. Vercel account (free at [vercel.com](https://vercel.com))

### Option 1: Deploy using Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy the project:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? `Y`
   - Which scope? (select your account)
   - Link to existing project? `N`
   - What's your project's name? (press Enter to use default)
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

### Option 2: Deploy using GitHub Integration

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will automatically detect the project settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist/spa`
   - Install Command: `npm install`
6. Click "Deploy"

### Configuration Details

The project includes:
- `vercel.json`: Configures builds for static files and server functions
- `vercel-build` script in package.json: Runs both client and server builds
- Proper routing for API endpoints and static content

### Environment Variables

If your application requires environment variables:
1. Add them in the Vercel project settings under "Environment Variables"
2. They will be automatically available to your application

### Post-Deployment

After deployment:
1. Vercel will provide you with a deployment URL
2. You can add a custom domain in the project settings if needed
3. Future git pushes to the main branch will trigger automatic deployments