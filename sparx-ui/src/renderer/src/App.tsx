import React, { useState, ReactElement, KeyboardEvent, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, Settings, ArrowRight, Plus, X, Loader2, FileText, Code, Zap } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface Tab {
  id: string;
  title: string;
  url: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const IridescentSparkle = (): ReactElement => (
  <motion.div 
    animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.3, 1] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="absolute h-[6px] w-[6px] rounded-full bg-gradient-to-r from-cyan-300 via-green-300 to-magenta-400"
  />
);

function App(): ReactElement {
  const [tabs, setTabs] = useState<Tab[]>([{ id: '1', title: 'Google', url: 'https://www.google.com' }])
  const [activeTabId, setActiveTabId] = useState<string>('1')
  const [inputUrl, setInputUrl] = useState<string>('https://www.google.com')

  const [isChatOpen, setIsChatOpen] = useState<boolean>(false)
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'ai', content: 'Sparx intelligence is online. Navigate to a page and ask me to summarize it, or ask me to write some code!' }
  ])

  const lastMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleAddTab = (): void => {
    const newId = Date.now().toString()
    const newTab: Tab = { id: newId, title: 'New Tab', url: 'https://www.google.com' }
    setTabs([...tabs, newTab])
    setActiveTabId(newId)
    setInputUrl('https://www.google.com')
  }

  const handleCloseTab = (e: React.MouseEvent, idToClose: string): void => {
    e.stopPropagation() 
    if (tabs.length === 1) return
    const newTabs = tabs.filter(tab => tab.id !== idToClose)
    setTabs(newTabs)
    if (activeTabId === idToClose) {
      const lastTab = newTabs[newTabs.length - 1]
      setActiveTabId(lastTab.id)
      setInputUrl(lastTab.url)
    }
  }

  const handleSwitchTab = (tab: Tab): void => {
    setActiveTabId(tab.id)
    setInputUrl(tab.url)
  }

  const handleNavigate = (e: KeyboardEvent<HTMLInputElement> | { key: string }): void => {
    if (e.key === 'Enter') {
      let finalUrl = inputUrl
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }
      setTabs(tabs.map(tab => tab.id === activeTabId ? { ...tab, url: finalUrl, title: finalUrl } : tab))
      setInputUrl(finalUrl)

      const webview = document.getElementById(`webview-${activeTabId}`) as any
      if (webview && webview.loadURL) {
        webview.loadURL(finalUrl)
      }
    }
  }

  const getActivePageText = async (): Promise<string> => {
    const webview = document.getElementById(`webview-${activeTabId}`) as any
    if (webview && webview.executeJavaScript) {
      try {
        const text = await webview.executeJavaScript('document.body.innerText')
        return text ? text.substring(0, 5000) : ""
      } catch (err) {
        console.error("Could not read page content", err)
        return ""
      }
    }
    return ""
  }

  // --- THE FIX: We updated this to accept an optional 'overrideMessage' from our buttons ---
  const handleSendMessage = async (overrideMessage?: string | React.MouseEvent): Promise<void> => {
    // Determine if we are sending the typed message or a quick prompt
    const messageToSend = typeof overrideMessage === 'string' ? overrideMessage : currentMessage;

    if (!messageToSend.trim() || isTyping) return

    setChatHistory(prev => [...prev, { role: 'user', content: messageToSend }, { role: 'ai', content: '' }])
    
    // Only clear the input box if we actually typed something
    if (typeof overrideMessage !== 'string') {
      setCurrentMessage('')
    }
    setIsTyping(true) 

    try {
      const pageContext = await getActivePageText()

      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, context: pageContext })
      })

      if (!response.ok) throw new Error('Network response was not ok')
      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false
      setIsTyping(false) 

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunkText = decoder.decode(value, { stream: true })
          setChatHistory(prev => {
            const newHistory = [...prev]
            newHistory[newHistory.length - 1].content += chunkText
            return newHistory
          })
        }
      }

    } catch (error) {
      console.error('Error fetching AI response:', error)
      setChatHistory(prev => {
        const newHistory = [...prev]
        newHistory[newHistory.length - 1].content = "Error connecting to AI engine."
        return newHistory
      })
      setIsTyping(false) 
    }
  }

  const iridescentCyan = "rgba(34, 211, 238, 1)";
  const iridescentViolet = "rgba(139, 92, 246, 1)";

  return (
    <div className="relative h-screen w-full bg-sparx-dark overflow-hidden flex font-sans antialiased text-white">
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px]" style={{ background: `radial-gradient(circle, ${iridescentCyan} 0%, rgba(16,185,129,0) 70%)` }} />
      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.2, 0.05] }} transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, ${iridescentViolet} 0%, rgba(245,158,11,0) 70%)` }} />
      <div className="absolute top-[20%] left-[30%]"><IridescentSparkle /></div>
      <div className="absolute top-[60%] right-[30%]"><IridescentSparkle /></div>

      <div className="z-20 w-16 h-full bg-white/5 border-r border-cyan-400/20 backdrop-blur-3xl flex flex-col items-center py-6 gap-8 shadow-[1px_0_10px_0_rgba(255,255,255,0.03)]">
        <motion.div onClick={() => setIsChatOpen(!isChatOpen)} className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner cursor-pointer hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg, rgba(34,211,238,1) 0%, rgba(16,185,129,1) 50%, rgba(139,92,246,1) 100%)" }} animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="text-white w-6 h-6" />
        </motion.div>
        <div className="flex-1 flex flex-col gap-6 mt-4">
          <button className="p-3 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"><Search className="w-6 h-6" /></button>
        </div>
        <button className="p-3 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"><Settings className="w-6 h-6" /></button>
      </div>

      <div className="z-10 flex-1 flex flex-col relative bg-black/5 rounded-l-2xl border-l border-white/10 shadow-inner overflow-hidden">
        <div className="border-b border-cyan-400/10 backdrop-blur-xl bg-black/10 flex flex-col shadow-sm">
          <div className="flex items-center px-4 pt-2 gap-2 overflow-x-auto no-scrollbar border-b border-cyan-400/10 bg-black/10">
            <AnimatePresence>
              {tabs.map((tab) => (
                <motion.div key={tab.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => handleSwitchTab(tab)} className={`group relative flex items-center justify-between w-48 px-4 py-2 rounded-t-lg cursor-pointer transition-colors ${activeTabId === tab.id ? 'bg-white/10 text-white border-t border-cyan-400/30' : 'text-gray-400 hover:bg-white/5'}`}>
                  <span className="text-xs truncate max-w-[120px] font-medium tracking-wide">{tab.title}</span>
                  <button onClick={(e) => handleCloseTab(e, tab.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-white/20 transition-all"><X className="w-3 h-3" /></button>
                  {activeTabId === tab.id && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-cyan-400 via-green-400 to-violet-500 shadow-[0_0_10px_2px_rgba(34,211,238,0.3)]" />}
                </motion.div>
              ))}
            </AnimatePresence>
            <button onClick={handleAddTab} className="p-2 mb-1 rounded-full hover:bg-white/10 text-cyan-300/80 hover:text-cyan-200 transition-colors"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="h-12 flex items-center px-6">
            <div className="w-full max-w-2xl mx-auto h-8 bg-black/50 border border-cyan-400/20 rounded-full flex items-center px-4 shadow-inner">
              <input type="text" className="w-full bg-transparent border-none outline-none text-xs text-gray-200 placeholder-gray-500 font-mono tracking-tight" placeholder="Sparx intelligence is online. Ask anything..." value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} onKeyDown={handleNavigate} />
              <button onClick={() => handleNavigate({ key: 'Enter' })} className="ml-2 p-1 rounded-full hover:bg-white/10 text-cyan-400 hover:text-cyan-200 transition-colors"><ArrowRight className="w-3 h-3" /></button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 bg-white relative">
          {tabs.map((tab) => (
            <webview key={tab.id} id={`webview-${tab.id}`} src={tab.url} className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${activeTabId === tab.id ? 'z-10 opacity-100' : 'z-0 opacity-0 hidden'}`} /* eslint-disable-next-line react/no-unknown-property */ allowpopups={true} />
          ))}
        </div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.div initial={{ x: "100%", opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: "100%", opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute right-0 top-0 h-full w-[450px] bg-sparx-dark/95 backdrop-blur-3xl border-l border-cyan-400/20 z-50 flex flex-col shadow-[-10px_0_40px_0_rgba(0,0,0,0.4)]">
              <div className="h-16 border-b border-cyan-400/10 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400 shadow-[0_0_5px_0_rgba(34,211,238,0.5)]" />
                  <span className="font-semibold text-white tracking-wider text-sm">Sparx Intelligence</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 no-scrollbar bg-black/10">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-3xl text-[13px] leading-relaxed max-w-[92%] border ${msg.role === 'ai' ? 'bg-white/5 text-gray-200 self-start rounded-tl-sm border-white/5 shadow-inner' : 'bg-gradient-to-br from-cyan-600 to-violet-700 text-white self-end rounded-tr-sm shadow-[0_5px_15px_rgba(34,211,238,0.2)] border-cyan-500/20'}`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          code({node, inline, className, children, ...props}: any) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                              <SyntaxHighlighter {...props} children={String(children).replace(/\n$/, '')} style={vscDarkPlus} language={match[1]} PreTag="div" className="rounded-md my-2 border border-white/10 text-xs overflow-x-auto" />
                            ) : (
                              <code {...props} className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-xs">
                                {children}
                              </code>
                            )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                ))}
                <div ref={lastMessageRef} />

                {(isTyping || (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'ai' && chatHistory[chatHistory.length - 1].content === "")) && (
                  <div className="self-start text-cyan-400/80 flex items-center gap-2 text-xs font-medium tracking-wide">
                    <Loader2 className="w-4 h-4 animate-spin" /> Sparx is streaming...
                  </div>
                )}
              </div>

              {/* --- NEW: Quick Prompts Row --- */}
              <div className="px-4 pb-2 pt-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-cyan-400/10 bg-black/20 backdrop-blur-md">
                {[
                  { icon: FileText, label: "Summarize", text: "Summarize the main points of this page in 3 clear bullet points." },
                  { icon: Code, label: "Explain Code", text: "Explain the code snippets on this page step-by-step." },
                  { icon: Zap, label: "Action Items", text: "Extract any actionable items or key takeaways from this page." }
                ].map((prompt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(prompt.text)}
                    disabled={isTyping}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-cyan-400/20 text-cyan-100 text-[11px] font-medium whitespace-nowrap hover:bg-white/10 hover:border-cyan-400/50 transition-colors disabled:opacity-50"
                  >
                    <prompt.icon className="w-3 h-3 text-cyan-400" />
                    {prompt.label}
                  </button>
                ))}
              </div>

              {/* Standard Input Area */}
              <div className="p-4 pt-2 bg-black/20 backdrop-blur-md">
                <div className="relative flex items-center">
                  <input type="text" value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask me to summarize, analyze code..." disabled={isTyping} className="w-full bg-black/40 border border-cyan-400/20 rounded-full py-3.5 pl-6 pr-14 text-[13px] text-white placeholder-gray-500 outline-none focus:border-cyan-400/50 transition-colors disabled:opacity-50 font-sans tracking-tight" />
                  <button onClick={handleSendMessage} disabled={isTyping} className="absolute right-2 p-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-full text-white hover:scale-105 transition-transform shadow-lg disabled:opacity-60 disabled:hover:scale-100"><ArrowRight className="w-4.5 h-4.5" /></button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App