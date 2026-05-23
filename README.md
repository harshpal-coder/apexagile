# ApexAgile: Enterprise MERN Agile Project Management System

ApexAgile is a high-performance, visually stunning full-stack MERN SaaS application engineered for modern software squads. Heavily inspired by the structural workflows of Atlassian Jira and the elite fluid responsiveness of Linear/Notion, ApexAgile simplifies ticket dragging, sprint rollover completions, timelines, and team mentions.

---

## 🚀 Key Architectural Highlights

* **Dual-Mode Persistence Engine**: ApexAgile boots seamlessly in one of two modes:
  * **Real Database Mode (MongoDB)**: Connects using standard Mongoose drivers when a `MONGODB_URI` environment string is defined in `.env`.
  * **Offline Developer Mode (Zero-Config Fallback)**: Automatically falls back to a high-speed, local auto-saving JSON-file database engine (`server/data/db.json`). All CRUD task transactions, sprint status completions, role elevations, and timeline feeds are 100% interactive and persistent out of the box!
* **Optimistic Kanban Updates**: Cards transition instantly on drag drop commands. The UI is updated in Zustand states prior to hit REST endpoints, reverting state smoothly if network requests fail.
* **Contextual Conversations with User Mentions**: Discuss tickets inside issues. Standard `@username` mentions inside comments are parsed by backend regex routers to trigger real-time alerts.
* **Light / Dark Mode Ecosystem**: Includes CSS variables bound directly to standard theme selectors, saving preferences in local storage.

---

## 🔐 Quick-Access Demo Roster Accounts
The platform pre-seeds with realistic agile workspaces, completed velocity sprint data, and active tickets. Simply click the **Autofill Buttons** on the Login Page, or type:

| Role | Email Address | Password | Profile Seed |
| :--- | :--- | :--- | :--- |
| **👑 Admin (Lead)** | `admin@agile.com` | `password123` | `harsh_admin` |
| **👔 Manager (PM)** | `manager@agile.com` | `password123` | `sarah_pm` |
| **💻 Member (Developer)** | `alice@agile.com` | `password123` | `alice_dev` |
| **💻 Member (Developer)** | `bob@agile.com` | `password123` | `bob_dev` |

---

## 🛠️ Step-by-Step Local Setup

Follow these commands in your terminal shell:

### 1. Initialize Express Backend
```bash
# Navigate to server
cd server

# Install dependencies (Express, Mongoose, JWT, bcryptjs, CORS)
npm install

# Run database seeder (seeds all demo projects, sprints, tasks, and credentials)
npm run seed

# Launch developer live server (running on http://localhost:5000)
npm run dev
```

### 2. Initialize Vite React Frontend
```bash
# Navigate to client folder
cd ../client

# Install dependencies (Zustand, Framer Motion, Lucide React, Canvas Confetti)
npm install --legacy-peer-deps

# Launch Vite development local server (running on http://localhost:5173)
npm run dev
```

---

## 📂 File Architecture Map

```text
demand/
├── server/                    # Node/Express Backend
│   ├── config/                # Mongoose & JSON Engine Connectors
│   ├── controllers/           # Auth, Sprint, Task, Workspace controllers
│   ├── models/                # Schema definitions (Mongo/JSON dual mode)
│   ├── middleware/            # JWT validation and Role authorize filters
│   ├── routes/                # REST endpoints routers
│   ├── utils/                 # Seeder and Local dbEngine helper
│   ├── data/                  # Offline persistence store (db.json)
│   └── server.js              # Server entry point
│
├── client/                    # Vite / React Frontend
│   ├── src/
│   │   ├── components/        # Skeletons, Common UI buttons
│   │   ├── context/           # Zustand modular state stores
│   │   ├── layouts/           # Desktop Sidebar, Notifications Header
│   │   ├── pages/             # Landing, Sprints, Kanban Board, Admin Settings
│   │   ├── utils/             # Lightweight custom popstate listener router
│   │   ├── index.css          # CSS Variables, Google Fonts Outfit link
│   │   └── App.jsx            # Routing bindings
│   ├── index.html             # Master HTML template
│   └── tailwind.config.js     # Glass shadows and slate color theme tokens
```

---

## ⚡ Deployment Checklist
To deploy to cloud services like Render, Heroku, or Vercel:
1. Create a MongoDB Atlas cluster and acquire your `MONGODB_URI` connection string.
2. In your host dashboard, declare the following environment variables:
   * `PORT` = `5000`
   * `MONGODB_URI` = `mongodb+srv://...`
   * `JWT_SECRET` = `your_custom_production_jwt_key`
3. Launch, compile Vite bundles (`npm run build`), and let the team build at warp speed!
