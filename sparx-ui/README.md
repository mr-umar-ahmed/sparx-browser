# Sparx ✦ | The AI-Native Chromium Workspace

Sparx is a privacy-first, fully functional desktop web browser with a deeply integrated AI engine. Built from the ground up, Sparx doesn't just let you browse the web—it reads the active DOM, permanently memorizes your local PDFs via a Vector Database, and executes real-time web searches to augment its local LLM inference. 

![Sparx UI](https://via.placeholder.com/1000x600?text=Insert+Screenshot+of+Sparx+UI+Here)

## 🚀 Key Features

* **Custom Browser Shell:** Built on Electron and React, featuring complete tab management, back/forward history, secure `localStorage` state persistence, and a Command Palette (`Ctrl+K`).
* **Tri-Layer AI Context Engine:**
  1. **Active Page Intelligence:** Securely executes JavaScript to scrape the active DOM, allowing the AI to summarize or explain the exact webpage you are viewing.
  2. **Vector Memory (RAG):** Integrates **ChromaDB** to chunk and embed uploaded PDFs. Sparx permanently "remembers" your documents across sessions.
  3. **Live Web Agent:** Bypasses LLM training cutoffs by silently querying DuckDuckGo in the background to inject real-time facts into the context window.
* **Local & Private Inference:** Powered by a local Python/FastAPI microservice running **Ollama** (Llama 3 / Phi-3). No paid API keys, complete data privacy.
* **Cloud Sync & Authentication:** Features a stunning glassmorphic UI integrated with **Firebase**. Users can create secure accounts to sync their bookmarks and browsing history across devices in real-time.
* **Real-Time Streaming Interface:** Custom React markdown parser with Prism syntax highlighting and buttery-smooth token streaming.

## 🛠️ Technology Stack

**Frontend (Browser UI)**
* React 19 + TypeScript
* Electron & Vite
* Tailwind CSS + Framer Motion
* Firebase (Auth & Firestore)

**Backend (AI Microservice)**
* Python 3
* FastAPI + Uvicorn (Streaming endpoints)
* Ollama (Local LLM Inference)
* ChromaDB (Vector Database) + LangChain (Text Splitters)
* PyPDF2 + DDGS (DuckDuckGo Search)

## ⚙️ Installation & Local Setup

Sparx runs as a dual-service architecture. You need to start the AI Brain, and then launch the UI.

### 1. Start the AI Engine
Ensure you have [Ollama](https://ollama.com/) installed and running locally with your preferred model (`ollama run llama3`).
```bash
cd sparx-ai-engine
python -m venv venv
# Activate the environment (Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install fastapi uvicorn pydantic ollama chromadb langchain-text-splitters PyPDF2 ddgs
uvicorn main:app --reload --port 8000

2. Start the Frontend Browser
Open a second terminal.

Bash
cd sparx-ui
npm install
npm run dev


📦 Building for Production
To package Sparx into a standalone Windows .exe executable:

Bash
cd sparx-ui
npm run build:win

The compiled installer will be located in the sparx-ui/dist/ directory.