# ⚡ Sparx Browser

Sparx is a next-generation, AI-native desktop web browser built with a dual-layer architecture. It replaces standard web browsing with an intelligent workspace, combining a custom React/Electron Chromium shell with a completely local, privacy-first Python AI engine.

for imgeas check relese tab 


## ✨ Core Features

* **🤖 Autonomous Research Agents:** Type `/agent [task]` and Sparx will break down your prompt, generate an execution plan, seamlessly scrape multiple sources, and compile a comprehensive Markdown report.
* **🧠 Smart Vector Memory:** Click "Memorize Page" or upload a PDF, and Sparx will chunk and vectorize the document into a local ChromaDB instance, allowing you to chat with your past research forever.
* **📑 Multi-Tab Synthesis:** Use the `/compare` command to force the AI to simultaneously read the DOM of *all* currently open tabs to cross-reference information and generate comparative insights.
* **🕵️ Stealth Mode (Privacy Shield):** An air-gapped browsing state that visually transforms the UI, instantly pauses Firebase cloud syncing, and halts local history collection.
* **💻 Developer Mode:** Unlocks exclusive `/debug` and `/refactor` commands, injecting a Principal Software Engineer system prompt into the LLM context window.
* **🪄 Magic Auto-Extract:** A single-click URL bar widget that silently runs the AI in the background to extract key insights from long articles and saves them directly to your Knowledge Workspace.
* **⌨️ Global Command Palette:** Hit `Ctrl+K` to open a spotlight-style menu to instantly search the web, execute AI commands, or navigate tabs without touching your mouse.
* **🎨 3D Glassmorphic New Tab:** A custom start page featuring real-time tech news, GitHub trending repos, and a stunning 3D scroll-morphing Framer Motion hero animation.

## 🏗️ Architecture & Tech Stack

Sparx operates on a decoupled architecture, allowing the heavy AI inference and vector math to run entirely locally without slowing down the UI thread or incurring external API costs.

### Frontend: Browser Shell (`sparx-ui`)
* **Framework:** Electron, React 19, TypeScript, Vite.
* **UI/UX:** Tailwind CSS, Framer Motion (spring physics), Lucide Icons, React Markdown.
* **Cloud Sync:** Firebase Firestore (syncs Bookmarks, History, and Workspace notes across devices).

### Backend: AI Engine (`sparx-ai-engine`)
* **Server:** FastAPI (Python).
* **AI Inference:** Ollama (Local execution of `llama3`, `phi3`, or `mistral`).
* **RAG & Memory:** ChromaDB (Vector Store), PyPDF2, LangChain Text Splitters.
* **Live Web Access:** DuckDuckGo Search API (`ddgs`).

---

## 🚀 Getting Started (Development)

To run Sparx locally, you need to start both the Python AI Engine and the React Frontend.

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* [Ollama](https://ollama.com/) installed locally.
* *Once Ollama is installed, open your terminal and run: `ollama pull llama3`*

### 1. Start the AI Engine (Backend)
Open a terminal and navigate to the backend folder:
```bash
cd sparx-ai-engine

# Create and activate a virtual environment
python -m venv venv
source venv/Scripts/activate  # On Windows
# source venv/bin/activate    # On Mac/Linux

# Install dependencies
pip install fastapi uvicorn chromadb langchain-text-splitters pypdf2 duckduckgo-search

# Start the server
uvicorn main:app --port 8000 --reload


2. Start the Browser Shell (Frontend)
Open a second terminal and navigate to the frontend folder:

Bash
cd sparx-ui

# Install dependencies
npm install

# Start the Electron development app
npm run dev


📦 Building for Production

To use Sparx as your daily driver, you can compile the frontend into a standalone Windows .exe installer.Ensure you are in the sparx-ui folder.
Run the build command:

npm run build:win


(Note: This uses electron-builder to generate an NSIS installer).

Locate the generated .exe file inside the sparx-ui/dist/ directory.

Running the AppBecause the AI engine relies on local Python execution, ensure your sparx-ai-engine FastAPI server is running in the background before launching the compiled Sparx.exe.

(Tip: You can create a simple .bat or .vbs script to launch both the Python server and the .exe simultaneously!)



📖 Slash Command Reference


Access these commands by opening the Sparx sidebar (Ctrl+K -> Chat or click the Sparkles icon) and typing / in the input box.CommandFunction/agent [task]Launches the autonomous multi-step research agent./research [topic]Scrapes the web and generates a highly structured Markdown report./compareReads the text content of all open tabs and synthesizes them./remember


Vectorizes the current webpage into your permanent ChromaDB memory./summarizeGenerates a concise 3-5 bullet point TL;DR of the active tab./explainSimplifies complex concepts found on the current page./debug(Dev Mode Only) Finds and fixes bugs in highlighted code on the page./refactor(Dev Mode Only) Optimizes and cleans up code snippets.



🤝 Contributing


Sparx is an open-source experiment in rethinking the modern web browser. 


Pull requests for new AI tools, performance optimizations in the webview, or UI enhancements are always welcome.



📝 License

MIT License.