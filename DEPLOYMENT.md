# Railway Deployment Guide

This guide will help you deploy the Udyam Registration Form to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Code should be pushed to GitHub
3. **Railway CLI** (optional): Install with `npm install -g @railway/cli`

## Deployment Steps

### Step 1: Deploy Backend (API)

1. **Create New Project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `atharvak-3000/open_biz`

2. **Configure Backend Service**
   - Railway will detect the backend automatically
   - Set the **Root Directory** to `backend`
   - Railway will use the `backend/railway.json` configuration

3. **Add Database**
   - In your Railway project, click "New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL` environment variable

4. **Set Environment Variables**
   - Go to your backend service settings
   - Add these environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     FRONTEND_URL=https://your-frontend-url.railway.app
     ```
   - `DATABASE_URL` is automatically provided by Railway

5. **Deploy**
   - Railway will automatically build and deploy
   - The build process will run: `npm install && npx prisma generate && npx prisma migrate deploy`

### Step 2: Deploy Frontend (Next.js)

1. **Create Frontend Service**
   - In the same Railway project, click "New Service"
   - Select "GitHub Repo" and choose the same repository
   - Set the **Root Directory** to `frontend`

2. **Set Environment Variables**
   - Go to your frontend service settings
   - Add this environment variable:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
     ```
   - Replace `your-backend-url` with your actual backend Railway URL

3. **Deploy**
   - Railway will automatically build and deploy
   - The build process will run: `npm install && npm run build`

### Step 3: Update CORS Configuration

1. **Get Frontend URL**
   - Copy your frontend Railway URL (e.g., `https://frontend-production-xxxx.up.railway.app`)

2. **Update Backend Environment**
   - Go to backend service settings
   - Update `FRONTEND_URL` environment variable with your frontend URL
   - Redeploy the backend service

## Environment Variables Summary

### Backend Environment Variables
```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.railway.app
DATABASE_URL=postgresql://... (automatically provided by Railway)
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

## Verification

1. **Check Backend**
   - Visit `https://your-backend-url.railway.app`
   - Should see: `{"message": "Udyam Registration API Server"}`

2. **Check Frontend**
   - Visit `https://your-frontend-url.railway.app`
   - Should see the multi-step registration form

3. **Test Complete Flow**
   - Step 1: Enter Aadhaar `123456789012`
   - Step 2: Enter OTP `123456`
   - Step 3: Enter PAN `ABCDE1234F`
   - Should complete successfully

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL service is running
   - Check `DATABASE_URL` environment variable
   - Verify Prisma migrations ran successfully

2. **CORS Error**
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check that frontend URL matches exactly (no trailing slash)

3. **Build Failures**
   - Check Railway build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

4. **API Connection Error**
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly in frontend
   - Check that backend URL is accessible
   - Verify both services are deployed and running

### Logs and Debugging

- **View Logs**: Go to Railway dashboard → Select service → View logs
- **Database Access**: Use Railway's built-in database browser
- **Environment Check**: Verify all environment variables are set correctly

## Production Considerations

1. **Database Backups**: Railway automatically backs up PostgreSQL databases
2. **SSL/HTTPS**: Railway provides SSL certificates automatically
3. **Custom Domains**: Can be configured in Railway dashboard
4. **Scaling**: Railway auto-scales based on traffic
5. **Monitoring**: Use Railway's built-in monitoring and alerts

## Cost Estimation

- **Hobby Plan**: $5/month per service (backend + frontend + database = ~$15/month)
- **Pro Plan**: Usage-based pricing for higher traffic
- **Free Tier**: Available with limitations (good for testing)

## Support

- **Railway Documentation**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: Community support
- **GitHub Issues**: For application-specific issues
