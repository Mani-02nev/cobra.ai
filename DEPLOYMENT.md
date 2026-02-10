# 🚀 Cobra AI - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Method 1: GitHub + Vercel (Automatic Deployments)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Cobra AI Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/cobra-ai.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `cobra-ai` repository
   - Click "Deploy"
   - Done! ✅

3. **Add Environment Variables** (Optional - for real AI API)
   - Go to Project Settings → Environment Variables
   - Add `API_URL` and `API_KEY`
   - Redeploy

### Method 2: Vercel CLI (Direct Deploy)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd cobra.ai
   vercel
   ```

3. **Follow prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy! 🎉

### Method 3: Drag & Drop (Easiest)

1. **Zip the project folder**
   - Right-click `cobra.ai` folder
   - Select "Compress"

2. **Upload to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Drag and drop the zip file
   - Click "Deploy"

---

## Alternative Hosting Options

### Netlify

1. **Drag & Drop**
   - Go to [app.netlify.com/drop](https://app.netlify.com/drop)
   - Drag the `cobra.ai` folder
   - Done!

2. **Environment Variables**
   - Site Settings → Build & Deploy → Environment
   - Add `API_URL` and `API_KEY`

### GitHub Pages

1. **Push to GitHub** (see Method 1 above)

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Pages → Source → Select `main` branch
   - Save

3. **Access at**: `https://YOUR_USERNAME.github.io/cobra-ai/`

### Cloudflare Pages

1. **Push to GitHub** (see Method 1 above)

2. **Create Cloudflare Pages Project**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Pages → Create a project
   - Connect your GitHub repository
   - Deploy

---

## Environment Variables Setup

### For Production API Integration

After deployment, add these environment variables in your hosting platform:

| Variable | Value | Example |
|----------|-------|---------|
| `API_URL` | Your AI API endpoint | `https://api.openai.com/v1/chat/completions` |
| `API_KEY` | Your API key | `sk-proj-...` |

### Vercel Environment Variables

```bash
# Using Vercel CLI
vercel env add API_URL
vercel env add API_KEY

# Or via dashboard:
# Project → Settings → Environment Variables
```

### Update Code

In `script.js`, change line 18:
```javascript
MOCK_MODE: false  // Enable real API
```

Then redeploy.

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain (e.g., `cobra-ai.com`)
3. Update DNS records as instructed
4. SSL certificate auto-generated ✅

### Netlify

1. Domain Settings → Add custom domain
2. Follow DNS configuration steps
3. Enable HTTPS

---

## Performance Optimization

### Already Optimized ✅

- ✅ No build process required
- ✅ Zero dependencies
- ✅ Minified inline SVGs
- ✅ CSS variables for theming
- ✅ Efficient animations (GPU-accelerated)
- ✅ LocalStorage for instant load

### Optional Enhancements

1. **Add Service Worker** (for offline support)
2. **Compress images** (if you add any)
3. **Enable CDN** (automatic on Vercel/Netlify)

---

## Testing Before Deploy

### Local Testing

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Browser Testing

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## Troubleshooting

### Deployment Issues

**Problem**: Build fails
- **Solution**: This is a static site, no build needed. Ensure `vercel.json` is present.

**Problem**: 404 errors
- **Solution**: Check `vercel.json` rewrites configuration.

**Problem**: Environment variables not working
- **Solution**: Redeploy after adding variables. Check variable names match code.

### API Issues

**Problem**: API calls failing
- **Solution**: 
  1. Check API_URL and API_KEY are correct
  2. Verify API provider has sufficient credits
  3. Check CORS settings on API provider
  4. Review browser console for errors

**Problem**: CORS errors
- **Solution**: Use a backend proxy or serverless function (see Advanced section)

---

## Advanced: Serverless API Proxy

To avoid exposing API keys client-side, create a Vercel serverless function:

### 1. Create `/api/chat.js`

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  const response = await fetch(process.env.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

### 2. Update `script.js`

```javascript
const CONFIG = {
  API_URL: '/api/chat',  // Use serverless function
  MOCK_MODE: false
};
```

### 3. Redeploy

Now API keys are secure on the server! 🔒

---

## Monitoring & Analytics

### Add Google Analytics

In `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Vercel Analytics

Enable in Project Settings → Analytics (automatic)

---

## Maintenance

### Regular Updates

1. **Monitor API usage** - Check provider dashboard
2. **Update dependencies** - None! Pure vanilla code
3. **Security** - Rotate API keys quarterly
4. **Backups** - Git commits are your backup

### Feature Additions

All code is in 3 files:
- `index.html` - Structure
- `style.css` - Styling
- `script.js` - Logic

Easy to modify and extend! 🎨

---

## Support

For issues or questions:
1. Check browser console for errors
2. Review this deployment guide
3. Check Vercel/Netlify documentation
4. Verify API provider status

---

**Ready to go live?** Choose a deployment method above and launch in under 5 minutes! 🚀
