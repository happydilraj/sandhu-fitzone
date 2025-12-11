# 🚀 Netlify Deployment Guide - Sandhu Fitzone

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Netlify account (free tier is fine)
- Your Neon database is already set up ✅

## Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name: `sandhu-fitzone` (or any name you prefer)
   - Keep it **Private** (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```bash
   cd /Users/dilraj/Documents/Gym/future-fit-gym-website
   git remote add origin https://github.com/YOUR_USERNAME/sandhu-fitzone.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy on Netlify

### Option A: Using Netlify Website (Recommended)

1. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Sign up or log in (you can use your GitHub account)

2. **Import your project:**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub
   - Select your `sandhu-fitzone` repository

3. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** (leave empty)

4. **Add Environment Variables:**
   Click "Show advanced" → "New variable" and add these:

   ```
   DATABASE_URL=your_neon_database_url
   JWT_SECRET=your_jwt_secret_key
   NODE_VERSION=18
   ```

   ⚠️ **IMPORTANT:** Get these values from your `.env.local` file!

5. **Deploy:**
   - Click "Deploy site"
   - Wait 2-3 minutes for the build to complete
   - Your site will be live at: `https://random-name-123.netlify.app`

### Option B: Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

## Step 3: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain (e.g., `sandhufitzone.com`)
4. Follow DNS configuration instructions
5. Netlify will automatically provision SSL certificate

## Step 4: Post-Deployment Checklist

✅ Test the following features:
- [ ] Homepage loads correctly
- [ ] Video plays on homepage
- [ ] Gallery images display
- [ ] Equipment page shows equipment with images
- [ ] Contact form works
- [ ] Member registration works (with OTP verification)
- [ ] Admin login works
- [ ] Admin can add/edit equipment
- [ ] Admin can view messages
- [ ] Admin can manage memberships

## Important Notes

### Environment Variables
Make sure these are set in Netlify:
- `DATABASE_URL` - Your Neon database connection string
- `JWT_SECRET` - Your JWT secret key (keep it secret!)
- `NODE_VERSION` - Set to `18`

### Database Connection
- Your Neon database is serverless and works perfectly with Netlify
- No additional configuration needed
- Connection pooling is handled automatically

### File Uploads
- Images uploaded by admin are stored in `public/uploads/`
- These will persist across deployments
- For production, consider using a CDN or cloud storage (Cloudinary, AWS S3, etc.)

### Continuous Deployment
- Every push to `main` branch will automatically trigger a new deployment
- You can disable this in Netlify settings if needed

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all environment variables are set correctly
- Verify Node version is 18

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard to ensure database is active
- Test connection locally first

### Images Not Loading
- Check if images are in `public/` folder
- Verify image paths start with `/` (e.g., `/uploads/image.jpg`)
- Clear browser cache

### Video Not Playing
- Ensure `video1.mp4` is in `public/` folder
- Check video file size (should be < 50MB for best performance)
- Try different browsers

## Performance Tips

1. **Optimize Images:**
   - Compress images before uploading
   - Use WebP format when possible
   - Recommended max size: 500KB per image

2. **Optimize Video:**
   - Compress video to reduce file size
   - Consider hosting on YouTube/Vimeo for large videos
   - Current video size: 29MB (acceptable)

3. **Enable Caching:**
   - Netlify automatically caches static assets
   - No additional configuration needed

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify environment variables
4. Test database connection

## Next Steps After Deployment

1. **Set up custom domain** (if you have one)
2. **Test all features** thoroughly
3. **Add admin users** for your gym staff
4. **Upload equipment images**
5. **Add gallery photos**
6. **Test member registration flow**
7. **Share the website** with your members! 🎉

---

**Your website will be live at:** `https://your-site-name.netlify.app`

**Admin Login:** `/login` with your admin credentials
