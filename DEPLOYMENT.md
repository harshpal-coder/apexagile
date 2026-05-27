# Deploying Frontend and Backend Separately (ApexAgile)

This guide provides step-by-step instructions for deploying the **ApexAgile MERN Platform** as two independent services: a static frontend (React/Vite) hosted on a global CDN (e.g., Vercel, Netlify, Cloudflare Pages) and a dynamic API backend (Node/Express) hosted on a cloud application runner (e.g., Render, Railway, Fly.io).

Separating your frontend and backend improves performance, scalability, and cost efficiency, as static assets are served instantly from CDNs, and backends only consume resources when answering API requests.

---

## Architecture Overview

```mermaid
graph LR
    User([User Browser]) -->|Loads HTML/JS/CSS| CDN[Static Host: Vercel/Netlify]
    User -->|Sends API requests| API[Backend Service: Render/Railway]
    API -->|Reads/Writes Data| DB[(MongoDB Atlas / Cloud Database)]
```

---

## Part 1: Deploying the Backend API

The backend is a Node.js/Express service. It runs on ports assigned by the hosting provider and connects to MongoDB.

### Recommended Providers
- **Render** (Web Services) - *Highly Recommended (Free Tier Available)*
- **Railway** - *Very Simple Setup*
- **Fly.io** or **Heroku**

### Deployment Steps (e.g., Render)

1. **Sign Up / Log In**: Go to [Render](https://render.com) and link your GitHub/GitLab account.
2. **Create New Web Service**: Click **New +** and select **Web Service**.
3. **Connect Repository**: Select your ApexAgile repository.
4. **Configure Settings**:
   - **Name**: `apexagile-backend` (or similar)
   - **Root Directory**: `server` (Important: Specify the server folder as the root directory to only deploy the backend code)
   - **Environment/Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. **Add Environment Variables**: Under the **Environment** tab, add the following variables:

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Sets the server environment | `production` |
| `PORT` | Server listening port | `5000` (Render/Railway inject this automatically) |
| `MONGODB_URI` | MongoDB Connection String | `mongodb+srv://user:pass@cluster.mongodb.net/apexagile?w=majority` |
| `JWT_SECRET` | Secret key for JWT signing | *Choose a strong, random password-like string* |
| `CORS_ORIGIN` | Authorized Frontend Domain(s) | `https://your-frontend-domain.vercel.app` (Specify once you have your frontend URL to protect the API) |
| `GOOGLE_CLIENT_ID` | Optional Google Sign-In | `your-google-oauth2-id.apps.googleusercontent.com` |

6. **Deploy**: Render will build and launch your API service. Once ready, copy your backend URL (e.g. `https://apexagile-api.onrender.com`).

---

## Part 2: Deploying the Frontend React App

The frontend is a fast, static React app built using Vite.

### Recommended Providers
- **Vercel** - *Highly Recommended (Best-in-class for Vite/React)*
- **Netlify** - *Extremely Easy*
- **Cloudflare Pages** - *Excellent performance and free tier limits*

### Deployment Steps (e.g., Vercel)

1. **Sign Up / Log In**: Go to [Vercel](https://vercel.com) and link your GitHub account.
2. **Import Project**: Click **Add New** -> **Project** and select your ApexAgile repository.
3. **Configure Settings**:
   - **Framework Preset**: `Vite` (Vercel will auto-detect this)
   - **Root Directory**: `client` (Important: Specify the client folder as the root directory)
   - **Build and Output Settings**:
     - **Build Command**: `npm run build` (or leave default Vite build)
     - **Output Directory**: `dist`
4. **Configure Environment Variables**: Expand the **Environment Variables** section and add the target API address pointing to your backend's API route:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Absolute path to the backend API | `https://apexagile-api.onrender.com/api` (Remember to append `/api` at the end) |

5. **Deploy**: Click **Deploy**. Vercel will install dependencies, compile the production assets, and publish your site globally.
6. **Final Step (CORS Security)**: Copy your live Vercel domain URL (e.g., `https://apexagile-app.vercel.app`) and paste it as the `CORS_ORIGIN` environment variable in your **Backend's** configuration panel, then trigger a redeploy of the backend.

---

## Security Best Practices
- **Restrict CORS in Production**: Do not leave `CORS_ORIGIN` unset in production. Setting it ensures only your frontend can interact with your API endpoints.
- **Secure JWT**: Keep `JWT_SECRET` out of version control. Always use the deployment platforms' environment variable managers.
- **HTTPS Only**: Modern platforms (like Vercel and Render) automatically serve your frontend and backend over HTTPS, which is required for secure authentication cookie and JWT header exchanges.
