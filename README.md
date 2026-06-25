<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cdxLGsAPlA1AIrg_rEq4iCFLIoHKo5Wx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

Quick helper (Windows PowerShell)
 - A convenience script `run-dev.ps1` is provided. From the project root run:
 ```powershell
 .\run-dev.ps1
 ```

## Deploy to Render (Recommended)

Render is the simplest and fastest way to deploy this app.

1. Push your code to GitHub:
```powershell
.\push-to-github.ps1
```
(Create a GitHub repo first at https://github.com/new if you haven't already)

2. Sign in to https://render.com (free account).

3. Click "New +" → "Static Site"
   - Connect your GitHub account
   - Select your `promptqi` repo
   - Render will auto-detect `render.yaml`

4. Render will show:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - (confirm these are correct)

5. Add Environment Variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your actual Gemini API key (from Gemini Studio)

6. Click "Create Static Site"

Your app will be live at: `https://your-site-name.onrender.com`

Render will auto-redeploy every time you push to `main` on GitHub.

## Deploy to Vercel or Netlify (Alternative)

I added CI workflow files for these platforms too:

- **Vercel**: `.github/workflows/deploy-vercel.yml` and `vercel.json`.
- **Netlify**: `.github/workflows/deploy-netlify.yml` and `netlify.toml`.

To use them, add the required secrets in GitHub Settings > Secrets and variables > Actions, then push to trigger deployment.
