# ⚡ Sparx Browser

Sparx is a highly performant, modern, and intelligent web browser. Built on a powerful dual-layer architecture, Sparx replaces standard web browsing with an intelligent workspace, combining a fast custom React/Electron Chromium shell with a local, privacy-first AI engine.

## ✨ Features

- **Vertical Tabs Navigation**: Seamlessly navigate through vertical tabs for a cleaner, modern web experience.
- **Global Command Palette (`Cmd/Ctrl + K`)**: Instantly search the web, execute AI commands, and navigate without ever touching your mouse.
- **Basic Privacy Shield**: An integrated ad and tracker blocker that drops requests to known analytics and tracking endpoints.
- **Autonomous Research Agents**: Type `/agent [task]` to have Sparx execute complex multi-step prompts.
- **Smart Vector Memory**: Memorize pages directly to your local ChromaDB instance for future context recall.
- **Multi-Tab Synthesis**: Cross-reference currently open tabs for rapid reading and comparison.
- **Magic Auto-Extract**: One-click summarize long articles to your knowledge workspace.
- **Modern UI/UX**: Designed using Tailwind CSS and Framer motion to create a smooth, beautiful, and distraction-free experience.

## 🏗️ Tech Stack

### Frontend: Browser Shell (`sparx-ui`)
- **Framework**: Electron, React 19, Vite, TypeScript.
- **UI/UX**: Tailwind CSS, Framer Motion, Lucide Icons.
- **Cloud Sync**: Firebase Firestore (syncs Bookmarks, History, and Notes).

### Backend: AI Engine (`sparx-ai-engine`)
- **Server**: FastAPI (Python).
- **AI Inference**: Ollama (`llama3`, `phi3`, or `mistral`).
- **RAG & Memory**: ChromaDB, PyPDF2, LangChain.
- **Live Web Access**: DuckDuckGo Search API.

---

## 🚀 Getting Started

To run Sparx locally, you need to start both the Python AI Engine and the React Frontend.

### Prerequisites
- Node.js (v18+)
- Python (3.9+)
- [Ollama](https://ollama.com/) (and run `ollama pull llama3`)

### 1. Start the AI Engine (Backend)
```bash
cd sparx-ai-engine
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install fastapi uvicorn chromadb langchain-text-splitters pypdf2 duckduckgo-search
uvicorn main:app --port 8000 --reload
```

### 2. Start the Browser Shell (Frontend)
Open a new terminal window:
```bash
cd sparx-ui
npm install
npm run dev
```

---

## 📦 Building for Production

To use Sparx as your daily driver, you can compile the frontend into a standalone application:

```bash
cd sparx-ui
npm run build:win   # For Windows
npm run build:mac   # For macOS
npm run build:linux # For Linux
```
*Note: This generates installers in the `sparx-ui/dist/` directory using `electron-builder`.*

## 🗺️ Roadmap
- Expand the Privacy Shield with customizable ad-block lists (e.g., EasyList).
- Implement WebExtensions API support for Chrome extension compatibility.
- Add multi-window management.
- Improve AI contextual reasoning across active tabs.

## 🤝 Contributing
Sparx is an open-source experiment to push the boundaries of modern browsing. Pull requests, performance optimizations, and UI enhancements are highly encouraged!

## 📝 License
MIT License.
