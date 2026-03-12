# 🌌 Sparx Browser

Sparx is a privacy-first, AI-native web browser. It combines a custom desktop browser environment with a fully local LLM (Large Language Model) to give you an intelligent research assistant that never sends your browsing data to the cloud.

![Sparx UI](https://via.placeholder.com/800x450.png?text=Add+a+screenshot+of+Sparx+here)

## ✨ Features
* **100% Local AI:** Powered by Ollama and Llama 3. No API keys, no cloud costs, complete privacy.
* **Page Intelligence:** Sparx can read the DOM of your currently active tab to summarize articles, extract data, and explain code.
* **Streaming Responses:** Real-time token streaming for a lightning-fast, ChatGPT-like experience.
* **Developer Assistant:** Built-in Markdown rendering and syntax highlighting for generated code.
* **Iridescent Glassmorphic UI:** A beautifully soothing, custom interface built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack
* **Frontend:** Electron, React, Vite, Tailwind CSS, Framer Motion
* **AI Engine (Backend):** Python, FastAPI, Ollama
* **LLM:** Llama 3 (8B)

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (v3.9+)
* [Ollama](https://ollama.com/) (Must be running in the background)

### 1. Start the AI Engine (Python)
Open a terminal in the `sparx-ai-engine` folder:
```bash
# Activate your virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install requirements
pip install fastapi uvicorn pydantic ollama

# Pull the local model
ollama pull llama3

# Start the server
uvicorn main:app --reload --port 8000
