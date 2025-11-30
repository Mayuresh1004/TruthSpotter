# 🧠 TruthSpotter  
### *AI-Powered Fact Verification Platform for Real-Time Crisis Response*

[![Live Demo](https://img.shields.io/badge/Try%20Now-Live%20App-green?style=for-the-badge&logo=vercel)](https://truthspotter.vercel.app)
[![React.js](https://img.shields.io/badge/Frontend-React.js-black?logo=nextdotjs&style=for-the-badge)]()
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js&style=for-the-badge)]()
[![Supabase](https://img.shields.io/badge/Auth%20%26%20DB-Supabase-3FCF8E?logo=supabase&style=for-the-badge)]()
[![LangChain](https://img.shields.io/badge/AI%20Pipeline-LangChain-000?logo=openai&style=for-the-badge)]()

---

## 🌍 Overview
**TruthSpotter** is an intelligent misinformation-tracking system that autonomously detects, analyzes, and verifies claims across news and social platforms — especially during **public crises** like elections, disasters, or health emergencies.  

Instead of just labeling something as *true or false*, it provides **transparent reasoning, source citations, and confidence levels**, helping users understand *why* a claim is or isn’t reliable.

> 🎯 Try it live: [**truthspotter.vercel.app**](https://truthspotter.vercel.app)

---

## 🔄 Five-Stage Agentic Cycle

| Agent Name       | Role               |
|------------------|--------------------|
| 🕵️‍♂️ **Watcher**  | Monitors and collects claims from multiple live data streams. |
| 🧱 **Filter**   | Uses anomaly detection and credibility scores to flag suspicious narratives. |
| 🧬 **Analyzer** | Performs deep verification — cross-checking data, metadata, and propagation behavior. |
| 🔦 **Revealer** | Presents confidence levels, supporting evidence, and explanation in a clear dashboard. |
| 🔁 **Refiner**  | Continuously learns from user feedback and evolving misinformation tactics. |

---

## 🚀 Key Highlights
- 🌐 **Autonomous Narrative Scanning** — Tracks breaking stories and misinformation in real time.  
- 🧩 **Explainable AI** — Every verdict comes with transparent reasoning and confidence metrics.  
- 🧠 **Multimodal Analysis** — Verifies claims using text, image provenance, and social propagation.  
- 📊 **Interactive Dashboard** — Visualizes trust scores and evidence relationships.  
- 🔄 **Adaptive Learning Loop** — Continuously evolves to counter new manipulation strategies.  
- 🧭 **Crisis-First Design** — Optimized for real-time, high-volume verification scenarios.

---

## ⚙️ Tech Stack
**Frontend:** Next.js, React, ShadCN UI, Lucide Icons  
**Backend:** Node.js, Express, PostgreSQL, LangChain  
**Storage & Auth:** Supabase  
**AI Layer:** Retrieval-Augmented Generation (RAG) + OpenAI Agents SDK with Gemini  
**Deployment:** Vercel  

---

## 🔐 Environment Variables

### Backend (`rag-verify`)

Required environment variables:

- `GOOGLE_GENERATIVE_AI_API_KEY` - Google Gemini API key (used for both agents and embeddings)
- `QDRANT_URL` - Qdrant vector database URL
- `QDRANT_API_KEY` - Qdrant API key for authentication
- `SERPAPI_KEY` - SerpAPI key for Google News search
- `PORT` - Server port (default: 3000)

### Frontend (`chatwiz-next`)

- `VITE_API_URL` - Backend API URL (default: `https://truthspotter.onrender.com`)
  
  Create a `.env` file in the `chatwiz-next` directory to override:
  ```env
  VITE_API_URL=https://truthspotter.onrender.com
  ```
  
  For local development, use:
  ```env
  VITE_API_URL=http://localhost:3000
  ```

Create a `.env` file in the `rag-verify` directory with these variables:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
SERPAPI_KEY=your_serpapi_key
PORT=3000
```

---

## 🧠 Why TruthSpotter is Unique
- 🪶 **Human-Centered Transparency:** Explains the reasoning process rather than issuing opaque verdicts.  
- 🔍 **Evidence-Linked Claims:** Users can click on sources to explore the data that led to each conclusion.  
- 🕸️ **Network-Level Insight:** Detects how misinformation propagates across platforms.  
- 🧩 **Agentic Framework:** Modular agents can scale or specialize depending on crisis type (health, politics, etc.).  
- 🔄 **Continuous Learning:** Feeds user interaction data into improving future verification accuracy.

---

## 📸 Demo Video  

[![TruthSpotter Demo](https://img.youtube.com/vi/EnMgeOr9jII/maxresdefault.jpg)](https://www.youtube.com/watch?v=EnMgeOr9jII)
> 🎥 *Click above to watch the TruthSpotter demo video.*


 
