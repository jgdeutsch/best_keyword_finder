# Deployment Guide

## GitHub Setup

1. Create a new repository on GitHub (don't initialize with README)

2. Run these commands:
```bash
git init
git add .
git commit -m "Initial commit: Keyword Finder app with authentication"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Vercel Deployment

1. Go to [Vercel](https://vercel.com) and sign in with GitHub

2. Click "New Project" and import your GitHub repository

3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `keyword-app` (important!)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

4. Add Environment Variables in Vercel Dashboard:
   - `DATAFORSEO_LOGIN` - Your DataForSEO email
   - `DATAFORSEO_PASSWORD` or `DATAFORSEO_API_PASSWORD` - Your DataForSEO API password
   - `APP_USERNAME` - Username for login (default: "admin")
   - `APP_PASSWORD` - Password for login (default: "admin123")
   - `NEXTAUTH_SECRET` - Generate a random secret (run: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

5. Deploy!

## Environment Variables Summary

### Required for DataForSEO API:
- `DATAFORSEO_LOGIN` - Your DataForSEO account email
- `DATAFORSEO_PASSWORD` or `DATAFORSEO_API_PASSWORD` - Your DataForSEO API password

### Required for Authentication:
- `APP_USERNAME` - Login username (optional, defaults to "admin")
- `APP_PASSWORD` - Login password (optional, defaults to "admin123")
- `NEXTAUTH_SECRET` - Secret key for NextAuth (required in production)
- `NEXTAUTH_URL` - Your app URL (required in production)

## Security Notes

- Never commit `.env` files to git
- Use strong passwords for `APP_PASSWORD` in production
- Generate a secure `NEXTAUTH_SECRET` for production
- Keep your DataForSEO API credentials secure

