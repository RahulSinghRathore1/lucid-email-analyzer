# 📧 Lucid Email Analyzer

An end-to-end email analysis platform that:
- Fetches incoming emails (IMAP)
- Extracts metadata (subject, sender, recipient, timestamps)
- Parses and visualizes the **receiving chain (hops)**
- Detects and displays **ESP (Email Service Provider)**
- Stores raw + processed logs in **MongoDB**
- Provides a **responsive React + Tailwind UI**

---

## 🚀 Features
- 📥 **Email ingestion** via IMAP (Gmail supported, extendable for other ESPs)
- 🗂 **MongoDB storage** (raw + processed email data)
- 🔎 **Metadata extraction**: subject, from, to, date, snippet
- 🛠 **Hop/receiving chain visualization** (timeline view)
- 📨 **ESP detection** (e.g., Gmail, Outlook, Yahoo)
- 📊 **Dashboard UI**: clean, mobile-friendly, with history of last 20 emails
- ⚡ **NestJS backend + React frontend**

---

## 🏗 Tech Stack
- **Frontend:** React + Vite + TailwindCSS + ShadCN + Lucide icons  
- **Backend:** NestJS (Node.js framework)  
- **Database:** MongoDB (Mongoose ODM)  
- **Deployment-ready:** Works locally, easily deployable to cloud (Render, Vercel, etc.)

---

## 📂 Project Structure
lucid-email-analyzer/
├── backend/ # NestJS backend (email ingestion, processing, API)
├── frontend/ # React + Tailwind UI

## Backend setup
cd backend
npm install
npm run start:dev


Configure .env with your email + MongoDB connection.

## Frontend setup
cd frontend
npm install
npm run dev
## Screenshot
<img width="1401" height="847" alt="image" src="https://github.com/user-attachments/assets/9022b43d-4839-4b09<img width="1401" height="847" alt="Screenshot 2025-09-03 194901" src="https://github.com/user-attachments/assets/f14cd4f7-608b-4c79-8d95-2ff500d94919" />
-87fb-77e07852e5b6" />

## Deployment
Deployed it with vercel and Render and db mMongodb Atlas
