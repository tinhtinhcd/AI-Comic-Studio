# Deploy to Cloudflare Pages

## Build Command
```bash
npm run build
```

## Output Directory
```
dist
```

## Environment Variables
None required for static deployment.

## Deployment Steps

### Option 1: Via Cloudflare Dashboard
1. Go to Cloudflare Pages dashboard
2. Create new project from GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Option 2: Via Wrangler CLI
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist --project-name=ai-comic-studio
```

## Important Notes

1. **SPA Routing**: The `functions/_middleware.js` file handles SPA routing for all sub-apps (studio, reader, admin)

2. **Auto-Login**: The application uses localStorage for demo authentication - no backend required

3. **API Mocking**: The middleware also mocks `/api/auth/*` endpoints for compatibility

4. **Default Language**: Set to English ('en') by default

## Troubleshooting

If you see a blank page or routing errors:
1. Clear browser cache (Ctrl+Shift+R)
2. Check Cloudflare Pages Functions are enabled
3. Verify the `functions/_middleware.js` is deployed
4. Check browser console for errors

## Project Structure
```
dist/
├── index.html          # Landing page (redirects to /studio/)
├── studio/
│   └── index.html      # Studio app
├── reader/
│   └── index.html      # Reader app
├── admin/
│   └── index.html      # Admin app
├── functions/
│   └── _middleware.js  # Cloudflare Pages Functions for routing
└── _redirects          # Fallback redirects
```
