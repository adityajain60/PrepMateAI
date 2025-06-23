# PrepMateAI

**AI-powered resume analysis and mock interview platform.**  
Built with React, Node.js/Express, MongoDB, and a Python microservice for advanced AI features.

---

## Features

- **AI Resume Analysis:** Upload your resume and a job description, get instant, actionable feedback.
- **Mock Interviews:** Personalized, AI-generated questions with real-time scoring and improvement tips.
- **Progress Tracking:** Dashboard with your history and performance metrics.
- **Secure Auth:** JWT-based login/signup.
- **Modern UI:** Responsive, clean, and fast (React + Tailwind CSS).

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Multer
- **AI Service:** Python, Flask, LangChain, Groq API, FAISS, HuggingFace
- **Dev Tools:** ESLint, Nodemon, Git

---

## Project Structure

```
PrepMateAI/
  frontend/         # React app
  backend/          # Node.js/Express API
  python-service/   # Python AI microservice
```

---

## Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/PrepMateAI.git
   cd PrepMateAI
   ```

2. **Python AI Service**
   ```bash
   cd python-service
   python -m venv venv
   venv\Scripts\activate  # or source venv/bin/activate
   pip install -r requirements.txt
   # Add GROQ_API_KEY to .env
   python app.py
   ```

3. **Backend**
   ```bash
   cd backend
   npm install
   # Add MongoDB URI, JWT_SECRET, PYTHON_SERVICE_URL to .env
   npm run dev
   ```

4. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Main API Endpoints

- `POST /api/signup` — Register
- `POST /api/login` — Login
- `POST /api/resume/analyze` — Analyze resume
- `GET /api/resume/history` — Resume analysis history
- `POST /api/interview/generate` — Generate interview questions
- `POST /api/interview/feedback` — Get answer feedback
- `GET /api/interview/history` — Interview history
- `GET /api/metrics` — Platform metrics

---

## Deployment

- **Frontend:** `npm run build` → deploy `dist/` to Vercel/Netlify
- **Backend:** Deploy to Railway/Heroku
- **Python Service:** Deploy to Railway/Render
- **Database:** Use MongoDB Atlas

---

## License

MIT

---
