import { useState, useEffect } from 'react';
import { safeParse, Tab } from './useBrowser';

export interface ChatMessage { role: 'user' | 'ai'; content: string; timestamp?: Date; }

export function useChat(activeTabId: string, tabs: Tab[], isDeveloperMode: boolean) {
  const [aiModel, setAiModel] = useState(() => localStorage.getItem('sparx_model') || 'llama3');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // --- NEW: Auto-Note Loading State ---
  const [isAutoNoting, setIsAutoNoting] = useState(false); 

  const [uploadedPdfText, setUploadedPdfText] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => safeParse('sparx_chat', [{ role: 'ai', content: `## Welcome to Sparx ✦\n\nI'm your intelligent browsing companion.`, timestamp: new Date() }]));

  useEffect(() => { localStorage.setItem('sparx_chat', JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem('sparx_model', aiModel); }, [aiModel]);

  const getActivePageText = async (): Promise<string> => {
    const webview = document.getElementById(`webview-${activeTabId}`) as any;
    if (!webview?.executeJavaScript) return '';
    try {
      const text = await webview.executeJavaScript('document.body.innerText');
      return text ? text.substring(0, 8000) : '';
    } catch { return ''; }
  };

  const getAllTabsText = async (): Promise<string> => {
    let combinedText = '';
    for (const tab of tabs) {
      const webview = document.getElementById(`webview-${tab.id}`) as any;
      if (webview?.executeJavaScript) {
        try {
          const text = await webview.executeJavaScript('document.body.innerText');
          if (text) combinedText += `\n\n--- CONTENT FROM TAB: ${tab.title} (${tab.url}) ---\n${text.substring(0, 2500)}`;
        } catch { console.warn(`Could not read tab ${tab.title}`); }
      }
    }
    return combinedText;
  };

  const handleFileUpload = async (file?: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
    setPdfName(file.name); setIsUploading(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/extract-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setUploadedPdfText(data.text);
        setChatHistory(p => [...p, { role: 'ai', content: `**${file.name}** loaded successfully.\n\nWhat would you like to know about this document?`, timestamp: new Date() }]);
      } else throw new Error(data.error || 'Unknown error');
    } catch (err) {
      setChatHistory(p => [...p, { role: 'ai', content: `Could not read the PDF. ${err instanceof Error ? err.message : 'Please try again.'}`, timestamp: new Date() }]);
    } finally { setIsUploading(false); }
  };

  const handleMemorizePage = async () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;
    setIsTyping(true);
    setChatHistory(p => [...p, { role: 'user', content: '/remember', timestamp: new Date() }]);
    try {
      const text = await getActivePageText();
      if (!text) throw new Error("Could not extract text from this page.");
      const res = await fetch('http://127.0.0.1:8000/api/memorize-page', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, title: activeTab.title, url: activeTab.url }),
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(p => [...p, { role: 'ai', content: `🧠 **Memory Updated!**\n\nI have successfully vectorized and saved **"${activeTab.title}"** into your permanent knowledge base. You can now ask me about this topic anytime, even if you close the tab.`, timestamp: new Date() }]);
      } else throw new Error(data.error || "Failed to memorize.");
    } catch (err: any) {
      setChatHistory(p => [...p, { role: 'ai', content: `❌ Memory Error: ${err.message}`, timestamp: new Date() }]);
    } finally { setIsTyping(false); }
  };

  // --- NEW: SILENT BACKGROUND EXTRACTION ---
  const handleAutoNote = async (saveNoteCallback: (title: string, content: string) => void) => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;
    
    setIsAutoNoting(true); // Triggers loading spinner on the UI button
    
    try {
      const ctx = await getActivePageText();
      if (!ctx) throw new Error("No text found");

      const payloadMessage = "SYSTEM DIRECTIVE: You are Sparx. Extract the most valuable insights, statistics, and key takeaways from the provided webpage text. Format it as a concise, highly readable Markdown note with bullet points. Do not include introductory pleasantries. Just output the clean markdown notes.";

      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payloadMessage, context: ctx, model: aiModel }),
      });
      
      if (!res.ok || !res.body) throw new Error('Stream failed');
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let done = false;
      let fullText = '';
      
      // Consume stream silently without updating chat UI
      while (!done) {
        const { value, done: rd } = await reader.read(); done = rd;
        if (value) fullText += decoder.decode(value, { stream: true });
      }
      
      // Save directly to workspace!
      saveNoteCallback(`Auto-Note: ${activeTab.title}`, fullText);
      
    } catch (err) {
      console.error("Auto-Note Failed", err);
    } finally {
      setIsAutoNoting(false);
    }
  };

  const handleSendMessage = async (override?: string) => {
    const msg = (override || currentMessage).trim();
    if (!msg || isTyping) return;

    if (msg.toLowerCase() === '/remember') { setCurrentMessage(''); return handleMemorizePage(); }
    
    setChatHistory(p => [...p, { role: 'user', content: msg, timestamp: new Date() }, { role: 'ai', content: '', timestamp: new Date() }]);
    setCurrentMessage(''); setIsTyping(true);
    
    try {
      let ctx = uploadedPdfText || await getActivePageText();
      let payloadMessage = msg;
      const devPersona = isDeveloperMode ? "SYSTEM DIRECTIVE: Act as an elite Principal Software Engineer. Be highly technical, precise, and favor code examples over long explanations. Ensure all code uses proper Markdown formatting." : "";

      if (msg.toLowerCase().startsWith('/research ')) {
        const topic = msg.substring(10).trim();
        payloadMessage = `SYSTEM DIRECTIVE: You are Sparx, an elite Deep Research AI. The user wants a comprehensive research report on: "${topic}". You MUST use your web search tool to find the most accurate and up-to-date information. Synthesize the results into a highly structured markdown report. You MUST include these exact headings: ## 📑 Topic Summary, ## 🔑 Key Findings, ## ⚖️ Pros & Cons, ## 🚀 Future Trends, ## 🔗 Sources. Do not include any pleasantries. Begin the report immediately.`;
      } 
      else if (msg.toLowerCase().startsWith('/agent ')) {
        const task = msg.substring(7).trim();
        payloadMessage = `SYSTEM DIRECTIVE: You are the Sparx Autonomous Agent. The user has assigned you a complex task: "${task}". Break this task down into logical steps, execute web searches to gather data, and compile a final, comprehensive response. Format your response exactly like this:\n## 🤖 Agent Execution Plan\n(List steps taken)\n## 📊 Data Gathered\n(Summarize data)\n## ✅ Final Result\n(Provide deliverable)\nBegin execution immediately.`;
      }
      else if (msg.toLowerCase().startsWith('/compare')) {
        ctx = await getAllTabsText(); 
        payloadMessage = `SYSTEM DIRECTIVE: You are Sparx. The user has multiple browser tabs open. I am providing you the text content from ALL of their open tabs in the context below. Please synthesize, compare, and summarize the information across these different tabs. Highlight the similarities, differences, and key takeaways. Format the response beautifully using Markdown.`;
      }
      else if (msg.toLowerCase().startsWith('/debug')) {
        payloadMessage = `${devPersona}\n\nThe user needs you to debug the code on the current page or in their message: "${msg.replace('/debug', '').trim()}". Analyze the provided context, identify any bugs, syntax errors, or logic flaws, and provide the corrected code with a brief explanation.`;
      }
      else if (msg.toLowerCase().startsWith('/refactor')) {
        payloadMessage = `${devPersona}\n\nThe user needs you to refactor the code on the current page or in their message: "${msg.replace('/refactor', '').trim()}". Rewrite it to be more modern, clean, efficient, and adhere to best practices. Explain the improvements.`;
      }
      else {
        if (isDeveloperMode) payloadMessage = `${devPersona}\n\nUSER MESSAGE: ${msg}`;
      }

      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: payloadMessage, context: ctx, model: aiModel }),
      });
      
      if (!res.ok || !res.body) throw new Error('Stream failed');
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let done = false;
      
      while (!done) {
        const { value, done: rd } = await reader.read(); done = rd;
        if (value) {
          const chunkText = decoder.decode(value, { stream: true });
          setChatHistory(prev => {
            const newHistory = [...prev]; const lastIndex = newHistory.length - 1;
            newHistory[lastIndex] = { ...newHistory[lastIndex], content: newHistory[lastIndex].content + chunkText };
            return newHistory;
          });
        }
      }
    } catch {
      setChatHistory(p => { const u = [...p]; u[u.length - 1].content = 'Connection lost. Please try again.'; return u; });
    } finally { setIsTyping(false); }
  };

  const clearChat = () => setChatHistory([{ role: 'ai', content: '## Fresh start ✦\n\nReady for your next question.', timestamp: new Date() }]);
  const handleWipeMemory = async () => {
    if(!window.confirm("Are you sure you want to permanently delete all parsed PDFs from Sparx memory?")) return false;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/memory', { method: 'DELETE' });
      if(res.ok) {
        setChatHistory(p => [...p, { role: 'ai', content: '🧠 Memory cleared successfully. I have forgotten all previously uploaded documents.', timestamp: new Date() }]);
        setPdfName(''); setUploadedPdfText('');
        return true;
      }
    } catch (err) { console.error("Failed to wipe memory", err); }
    return false;
  };

  return { aiModel, setAiModel, currentMessage, setCurrentMessage, isTyping, isAutoNoting, pdfName, setPdfName, uploadedPdfText, setUploadedPdfText, isUploading, chatHistory, handleFileUpload, handleSendMessage, handleAutoNote, handleMemorizePage, clearChat, handleWipeMemory };
}