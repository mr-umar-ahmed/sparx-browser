import React, { useState, ReactElement, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import {
  Search, Sparkles, Settings, ArrowRight, Plus, X,
  Loader2, FileText, Zap, Paperclip, Copy, Trash2,
  ChevronLeft, ChevronRight, RotateCw, Shield, Columns, 
  Clock, Globe, Command, Library, Bug, Terminal, Brain, EyeOff, PauseCircle, Bot, Wand2,
  MessageSquare, Home, ExternalLink, Bookmark, Cloud, CloudOff, Cpu, Database,
  Github, LayoutTemplate, MonitorPlay, Flame, Newspaper, TrendingUp
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

import { useAuth } from './hooks/useAuth';
import { useBrowser, safeParse } from './hooks/useBrowser';
import { useChat } from './hooks/useChat';
import { useCloudSync } from './hooks/useCloudSync';

// --- HELPER COMPONENTS ---

const StatusDot = ({ isPrivacy }: { isPrivacy?: boolean }): ReactElement => (
  <span className="relative flex h-2 w-2">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPrivacy ? 'bg-amber-400' : 'bg-blue-400'}`} />
    <span className={`relative inline-flex rounded-full h-2 w-2 ${isPrivacy ? 'bg-amber-500' : 'bg-blue-500'}`} />
  </span>
);

const TypingIndicator = ({ color }: { color: string }): ReactElement => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.span key={i} className="block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
    ))}
  </div>
);

// --- NEW: 21st.dev Style Spotlight Card ---
const SpotlightCard = ({ children, T, delay = 0 }: { children: React.ReactNode, T: any, delay?: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden rounded-2xl border shadow-sm group flex flex-col"
      style={{ background: T.surface, borderColor: T.border }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(37,99,235,0.06), transparent 80%)`,
        }}
      />
      <div className="relative p-6 flex-1 flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

// --- ENHANCED NEW TAB COMPONENT ---
const SparxNewTab = ({ onNavigate, T, isPrivacyMode }: { onNavigate: (url: string) => void, T: any, isPrivacyMode: boolean }) => {
  const [query, setQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const shortcuts = [
    { name: 'GitHub', url: 'https://github.com', icon: Github, color: '#111827', bg: '#f3f4f6' },
    { name: 'Localhost', url: 'http://localhost:3000', icon: MonitorPlay, color: '#10b981', bg: '#ecfdf5' },
    { name: 'Firebase', url: 'https://console.firebase.google.com', icon: Database, color: '#f59e0b', bg: '#fffbeb' },
    { name: 'React Native', url: 'https://reactnative.dev/', icon: LayoutTemplate, color: '#06b6d4', bg: '#ecfeff' },
    { name: 'Hugging Face', url: 'https://huggingface.co', icon: Cpu, color: '#fbbf24', bg: '#fffbeb' },
  ];

  const techNews = [
    { title: "React Native 0.74 Released: New Architecture Enabled by Default", source: "React Blog", time: "2h ago" },
    { title: "New open-source LLMs break context window limitations", source: "AI Weekly", time: "4h ago" },
    { title: "MongoDB 8.0: What full-stack MERN developers need to know", source: "DB Insider", time: "6h ago" },
    { title: "Vercel announces native support for new AI streaming protocols", source: "Frontend Daily", time: "8h ago" },
  ];

  const githubTrending = [
    { repo: "Significant-Gravitas/AutoGPT", desc: "An experimental open-source attempt to make AI fully autonomous.", stars: "155k", lang: "Python" },
    { repo: "facebook/react", desc: "The library for web and native user interfaces", stars: "218k", lang: "JavaScript" },
    { repo: "firebase/firebase-js-sdk", desc: "Firebase Javascript SDK for web and Node.js", stars: "5.2k", lang: "TypeScript" }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center pt-24 pb-12 px-8 relative overflow-y-auto no-scrollbar" style={{ background: T.bg }}>
      
      {/* 21st.dev Style Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-[10%] left-[20%] w-[35vw] h-[35vw] rounded-full blur-[100px] opacity-20 ${isPrivacyMode ? 'bg-amber-300' : 'bg-blue-300'}`} 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className={`absolute top-[30%] right-[15%] w-[40vw] h-[40vw] rounded-full blur-[120px] opacity-15 ${isPrivacyMode ? 'bg-orange-300' : 'bg-emerald-200'}`} 
        />
      </div>
      
      <div className="z-10 flex flex-col items-center w-full max-w-4xl">
        
        {/* Animated Header */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: T.text }}>Sparx</h1>
          </motion.div>
          
          {/* Blur-reveal greeting */}
          <motion.p 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: T.textMuted, fontSize: 16, fontWeight: 500 }}
          >
            {greeting}. Ready to build?
          </motion.p>
        </div>
        
        {/* Expanding Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, type: 'spring' }}
          className={`w-full max-w-2xl relative rounded-2xl overflow-hidden transition-all duration-300 ease-out mb-14 ${isSearchFocused ? 'shadow-2xl scale-[1.02]' : 'shadow-lg scale-100'}`}
          style={{ background: T.surface, border: `1px solid ${isSearchFocused ? T.accent : T.border}` }}
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 transition-colors duration-300" style={{ color: isSearchFocused ? T.accent : T.textMuted }} />
          </div>
          <input 
            type="text" 
            autoFocus
            value={query}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && query) onNavigate(query); }}
            placeholder="Search the web, or enter a URL..." 
            className="w-full py-5 pl-14 pr-16 text-lg outline-none bg-transparent"
            style={{ color: T.text }}
          />
          <AnimatePresence>
            {query && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => onNavigate(query)} 
                className="absolute inset-y-2 right-2 px-4 rounded-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95" 
                style={{ background: T.accentDim, color: T.accent }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Spring-physics Dock */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16 w-full"
        >
          {shortcuts.map((sc, i) => (
            <motion.button 
              key={i} 
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate(sc.url)} 
              className="flex flex-col items-center gap-3 p-3 rounded-2xl cursor-pointer group"
              style={{ minWidth: 90 }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border transition-shadow group-hover:shadow-md" style={{ backgroundColor: sc.bg, borderColor: T.border }}>
                <sc.icon className="w-7 h-7 transition-transform group-hover:scale-110" style={{ color: sc.color }} />
              </div>
              <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 500 }}>{sc.name}</span>
            </motion.button>
          ))}
          
          <motion.button 
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-3 p-3 rounded-2xl cursor-pointer group"
            style={{ minWidth: 90 }}
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm border border-dashed transition-colors group-hover:bg-gray-50" style={{ borderColor: T.border }}>
              <Plus className="w-7 h-7 transition-transform group-hover:rotate-90" style={{ color: T.textMuted }} />
            </div>
            <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 500 }}>Add</span>
          </motion.button>
        </motion.div>

        {/* Spotlight Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          <SpotlightCard T={T} delay={0.4}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Newspaper className="w-4 h-4" /></div>
              <h2 className="font-semibold text-sm tracking-wide uppercase" style={{ color: T.textMuted }}>Dev & AI Feed</h2>
            </div>
            <div className="flex flex-col gap-5">
              {techNews.map((news, i) => (
                <div key={i} className="group cursor-pointer">
                  <h3 className="font-medium text-[15px] leading-snug group-hover:text-blue-600 transition-colors mb-1.5" style={{ color: T.text }}>{news.title}</h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: T.textDim }}>
                    <span className="font-medium text-gray-500">{news.source}</span>
                    <span>•</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard T={T} delay={0.5}>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
              <h2 className="font-semibold text-sm tracking-wide uppercase" style={{ color: T.textMuted }}>Trending Repos</h2>
            </div>
            <div className="flex flex-col gap-4">
              {githubTrending.map((repo, i) => (
                <div key={i} className="group cursor-pointer p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[15px] group-hover:text-blue-600 transition-colors" style={{ color: T.accent }}>{repo.repo}</h3>
                    <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-white rounded-md border shadow-sm" style={{ color: T.textMuted, borderColor: T.border }}>
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> {repo.stars}
                    </div>
                  </div>
                  <p className="text-[13px] line-clamp-2 mb-3 leading-relaxed" style={{ color: T.textMuted }}>{repo.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: T.textDim }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.lang === 'JavaScript' ? '#f7df1e' : repo.lang === 'TypeScript' ? '#3178c6' : '#3572A5' }} />
                    {repo.lang}
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

        </div>
      </div>
    </div>
  );
};


export default function App(): ReactElement {
  const { user, isAuthLoading, login, signup, logout } = useAuth();
  
  const { 
    tabs, activeTabId, inputUrl, setInputUrl, isUrlFocused, setIsUrlFocused, 
    canGoBack, canGoForward, bookmarks, setBookmarks, history, setHistory, 
    notes, setNotes, 
    isPrivacyMode, setIsPrivacyMode,
    handleAddTab, handleCloseTab, handleSwitchTab, handleNavigate, addBookmark 
  } = useBrowser();

  const [isDeveloperMode, setIsDeveloperMode] = useState(() => safeParse('sparx_dev_mode', false));
  useEffect(() => { localStorage.setItem('sparx_dev_mode', JSON.stringify(isDeveloperMode)); }, [isDeveloperMode]);

  const {
    aiModel, setAiModel, currentMessage, setCurrentMessage, isTyping, isAutoNoting, pdfName, setPdfName,
    setUploadedPdfText, isUploading, chatHistory,
    handleFileUpload, handleSendMessage, handleAutoNote, handleMemorizePage, clearChat, handleWipeMemory
  } = useChat(activeTabId, tabs, isDeveloperMode); 

  const safeNotes = Array.isArray(notes) ? notes : []; 
  const { cloudStatus } = useCloudSync(user, bookmarks, history, safeNotes, setBookmarks, setHistory, setNotes || (() => {}), isPrivacyMode);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [activePanel, setActivePanel] = useState<'chat' | 'workspace' | 'history' | 'bookmarks'>('chat');
  
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [chatHistory, isTyping]);
  
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { 
        e.preventDefault(); 
        setShowCommandPalette(p => { if (!p) setTimeout(() => commandInputRef.current?.focus(), 50); return !p; }); 
      }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSaveToWorkspace = (content: string) => {
    if (!setNotes) return;
    const firstLine = content.split('\n').find(line => line.trim().length > 0) || "AI Insight";
    const cleanTitle = firstLine.replace(/[#*]/g, '').trim();
    const title = cleanTitle.length > 35 ? cleanTitle.substring(0, 35) + '...' : cleanTitle;
    const newNote = { id: Date.now().toString(), title, content, timestamp: Date.now() };
    setNotes(prev => { const prevArray = Array.isArray(prev) ? prev : []; return [newNote, ...prevArray]; });
    setActivePanel('workspace');
  };

  const triggerAutoNote = () => {
    if (!setNotes) return;
    handleAutoNote((title, content) => {
      const newNote = { id: Date.now().toString(), title, content, timestamp: Date.now() };
      setNotes(prev => { const prevArray = Array.isArray(prev) ? prev : []; return [newNote, ...prevArray]; });
      setIsChatOpen(true); setActivePanel('workspace');
    });
  };

  const executeCommand = (cmd: string) => {
    const q = cmd.toLowerCase().trim();
    setShowCommandPalette(false); setCommandQuery('');

    if (q.includes('workspace') || q.includes('notes')) { setIsChatOpen(true); setActivePanel('workspace'); }
    else if (q === 'remember' || q === 'memorize') { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleMemorizePage(), 100); }
    else if (q.includes('summarize') || q.includes('tldr')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage('/summarize'), 100); } 
    else if (q.includes('explain')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage('/explain'), 100); }
    else if (q.startsWith('research ')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage(`/${q}`), 100); }
    else if (q.startsWith('agent ')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage(`/${q}`), 100); }
    else if (q.startsWith('compare')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage('/compare'), 100); }
    else if (q.startsWith('debug')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage('/debug'), 100); }
    else if (q.startsWith('refactor')) { setIsChatOpen(true); setActivePanel('chat'); setTimeout(() => handleSendMessage('/refactor'), 100); }
    else if (q === 'extract' || q === 'auto note') { triggerAutoNote(); }
    else if (q === 'bookmark' || q === 'save') { addBookmark(); } 
    else if (q.includes('settings') || q.includes('config')) { setIsSettingsOpen(true); }
    else if (q === 'new tab') { handleAddTab(); }
    else if (q.startsWith('open ')) { const target = q.replace('open ', '').trim(); handleNavigate(target.includes('.') ? target : `https://www.${target}.com`); } 
    else if (q.startsWith('search ')) { const target = q.replace('search ', '').trim(); handleNavigate(`https://www.google.com/search?q=${encodeURIComponent(target)}`); } 
    else { handleNavigate(cmd); }
  };

  const slashCommands = useMemo(() => {
    const base = [
      { cmd: '/agent', label: 'Autonomous Agent', icon: Bot, text: 'Assign a complex multi-step task for Sparx to execute.' },
      { cmd: '/remember', label: 'Memorize Page', icon: Brain, text: 'Save the current webpage to your permanent Vector AI Memory.' },
      { cmd: '/research', label: 'Deep Research Mode', icon: Search, text: 'Type /research [topic] for a comprehensive AI report.' },
      { cmd: '/compare', label: 'Compare All Tabs', icon: Columns, text: 'Synthesize and compare the content across all open tabs.' },
      { cmd: '/summarize', label: 'Summarize Page', icon: FileText, text: 'Provide a concise 3-5 bullet point summary of the current page.' },
      { cmd: '/explain', label: 'Explain Concepts', icon: Zap, text: 'Explain the main concepts or complex paragraphs on this page simply.' },
      { cmd: '/translate', label: 'Translate Page', icon: Globe, text: 'Translate the main content of this webpage into English.' },
    ];
    if (isDeveloperMode) {
      base.unshift(
        { cmd: '/debug', label: 'Debug Code', icon: Bug, text: 'Find and fix bugs in the current page or snippet.' },
        { cmd: '/refactor', label: 'Refactor Code', icon: Terminal, text: 'Optimize and clean up the current code.' }
      );
    }
    return base;
  }, [isDeveloperMode]);

  const filteredSlashCommands = currentMessage.startsWith('/') ? slashCommands.filter(c => c.cmd.includes(currentMessage.toLowerCase())) : [];
  
  const quickPrompts = useMemo(() => isDeveloperMode ? [
    { icon: Bot, label: 'Agent', text: '/agent ' },
    { icon: Terminal, label: 'Refactor', text: '/refactor ' },
    { icon: Columns, label: 'Compare', text: '/compare' },
    { icon: Search, label: 'Research', text: '/research ' },
  ] : [
    { icon: Bot, label: 'Run Agent', text: '/agent ' },
    { icon: Columns, label: 'Compare Tabs', text: '/compare' }, 
    { icon: FileText, label: 'Summarize', text: '/summarize' },
    { icon: Search, label: 'Deep Research', text: '/research ' },
  ], [isDeveloperMode]);

  const handleAuthSubmit = async (e: React.FormEvent) => { e.preventDefault(); setAuthError(''); try { if (authMode === 'login') await login(email, password); else await signup(email, password); } catch (err: any) { setAuthError(err.message.replace('Firebase: ', '')); } };
  const onWipeMemoryClick = async () => { const success = await handleWipeMemory(); if (success) setIsSettingsOpen(false); };
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  const T = useMemo(() => {
    return {
      bg: '#f3f4f6', 
      surface: '#ffffff', 
      surfaceHover: '#f9fafb', 
      border: '#e5e7eb', 
      borderMuted: '#f3f4f6', 
      text: '#111827', 
      textMuted: '#6b7280', 
      textDim: '#9ca3af',
      accent: isPrivacyMode ? '#d97706' : '#2563eb',
      accentDim: isPrivacyMode ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.08)',
      userBubble: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      aiBubble: '#f9fafb', 
      aiBubbleBorder: '#e5e7eb', 
      inputBg: '#ffffff', 
      urlBg: '#f3f4f6', 
      urlFocusBorder: isPrivacyMode ? '#d97706' : '#3b82f6', 
      sidebarBg: '#e5e7eb', 
      panelBg: '#ffffff', 
      shadow: '0 10px 40px rgba(0,0,0,0.08)', 
      shadowSm: '0 2px 10px rgba(0,0,0,0.05)',
    };
  }, [isPrivacyMode]);

  if (isAuthLoading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  if (!user) {
    return (
      <div className="relative h-screen w-full bg-gray-50 overflow-hidden flex items-center justify-center font-sans antialiased text-gray-900">
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[140px]" style={{ background: `radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(255,255,255,0) 70%)` }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute top-[30%] -right-[15%] w-[50vw] h-[50vw] rounded-full blur-[120px]" style={{ background: `radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(255,255,255,0) 70%)` }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full max-w-md p-8 rounded-2xl bg-white border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-md cursor-pointer" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}><Sparkles className="text-white w-7 h-7" /></div>
          <h1 className="text-2xl font-semibold mb-2 tracking-tight text-gray-900">Welcome to Sparx</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">Sign in to sync your AI intelligence and browsing history.</p>
          
          <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-sm outline-none focus:border-blue-400 focus:bg-white transition-colors" />
            {authError && <div className="text-red-500 text-xs text-center">{authError}</div>}
            <button type="submit" className="w-full py-3 rounded-lg font-medium shadow-md hover:scale-[1.02] transition-transform" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white" }}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </motion.div>
      </div>
    );
  }

  const cssVars: React.CSSProperties = { '--bg': T.bg, '--surface': T.surface, '--border': T.border, '--text': T.text, '--text-muted': T.textMuted, '--accent': T.accent, '--accent-dim': T.accentDim, } as React.CSSProperties;

  return (
    <div style={{ ...cssVars, background: T.bg, color: T.text, fontFamily: '"DM Sans", system-ui, sans-serif' }} className="h-screen w-full overflow-hidden flex flex-col select-none">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { width: 4px; height: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; } ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .proto-badge { font-family: 'DM Mono', monospace; } .tab-strip-shadow { box-shadow: inset 0 -1px 0 ${T.border}; } .frosted { backdrop-filter: blur(20px) saturate(180%); } @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } } .suggestion-item { animation: fadeSlideIn 0.15s ease forwards; }`}</style>

      {/* TOP CHROME: TAB BAR */}
      <div style={{ background: T.sidebarBg, borderBottom: `1px solid ${T.border}` }} className="flex items-end h-11 px-2 gap-0.5 shrink-0 pt-2 frosted">
        {[...tabs.filter(t => t.pinned), ...tabs.filter(t => !t.pinned)].map(tab => (
          <motion.div key={tab.id} layout initial={{ opacity: 0, scaleX: 0.85 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0.85 }} onClick={() => handleSwitchTab(tab)} className="group relative flex items-center gap-2 cursor-pointer" style={{ minWidth: tab.pinned ? 40 : 120, maxWidth: tab.pinned ? 40 : 220, height: 36, padding: tab.pinned ? '0 10px' : '0 12px', borderRadius: '8px 8px 0 0', background: activeTabId === tab.id ? T.surface : 'transparent', borderTop: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent', borderLeft: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent', borderRight: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent', borderBottom: activeTabId === tab.id ? `1px solid ${T.surface}` : 'none', marginBottom: activeTabId === tab.id ? -1 : 0, }}>
            {tab.favicon ? <img src={tab.favicon} className="w-4 h-4 shrink-0 rounded" alt="" onError={e => (e.currentTarget.style.display = 'none')} /> : <Globe style={{ color: T.textMuted }} className="w-3.5 h-3.5 shrink-0" />}
            {!tab.pinned && (
              <>
                <span style={{ color: activeTabId === tab.id ? T.text : T.textMuted, fontSize: 12, fontWeight: 500 }} className="truncate flex-1">{tab.isLoading ? 'Loading…' : tab.title}</span>
                <button onClick={e => handleCloseTab(e, tab.id)} style={{ color: T.textMuted, borderRadius: 4 }} className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 p-0.5 ml-1"><X className="w-3 h-3" /></button>
              </>
            )}
            {activeTabId === tab.id && <div style={{ background: T.surface }} className="absolute bottom-0 left-0 right-0 h-px" />}
          </motion.div>
        ))}
        <button onClick={handleAddTab} style={{ color: T.textMuted, borderRadius: 6 }} className="flex items-center justify-center w-7 h-7 mb-0.5 hover:bg-black/5 transition-colors ml-1"><Plus className="w-4 h-4" /></button>
        <div className="flex-1" />
      </div>

      {/* NAVIGATION BAR */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }} className="h-12 flex items-center px-3 gap-2 shrink-0">
        <div className="flex items-center gap-0.5">
          {[{ icon: ChevronLeft, disabled: !canGoBack }, { icon: ChevronRight, disabled: !canGoForward }, { icon: RotateCw, disabled: false }].map(({ icon: Icon, disabled }, i) => (
            <button key={i} disabled={disabled} style={{ color: disabled ? T.textDim : T.textMuted, borderRadius: 6 }} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 disabled:cursor-not-allowed transition-colors"><Icon className="w-4 h-4" /></button>
          ))}
        </div>
        <button onClick={() => handleNavigate('sparx://newtab')} style={{ color: T.textMuted, borderRadius: 6 }} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"><Home className="w-4 h-4" /></button>
        
        <div className="flex-1 flex items-center gap-2 h-8 px-3 rounded-full transition-all" style={{ background: T.urlBg, border: `1px solid ${isUrlFocused ? T.urlFocusBorder : T.border}`, boxShadow: isUrlFocused ? `0 0 0 3px ${T.accentDim}` : 'none', }}>
          <div className="flex items-center gap-1.5 shrink-0">
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5" style={{ color: T.accent }} /> : <Shield className="w-3.5 h-3.5" style={{ color: inputUrl.startsWith('https') ? '#10b981' : T.textMuted }} />}
            {isDeveloperMode && <Terminal className="w-3 h-3 text-purple-500 ml-1" />}
          </div>
          <input 
            ref={urlInputRef} 
            type="text" 
            value={isUrlFocused ? inputUrl : (inputUrl === 'sparx://newtab' ? '' : (() => { try { return new URL(inputUrl).hostname.replace('www.', ''); } catch { return inputUrl; } })())} 
            onChange={e => setInputUrl(e.target.value)} 
            onFocus={() => { setIsUrlFocused(true); setTimeout(() => urlInputRef.current?.select(), 10); }} 
            onBlur={() => setIsUrlFocused(false)} 
            onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate(); }} 
            className="flex-1 bg-transparent outline-none text-sm" 
            style={{ color: T.text, fontFamily: isUrlFocused ? '"DM Mono", monospace' : '"DM Sans", sans-serif', fontSize: 13 }} 
            placeholder="Search or enter URL…" 
            spellCheck={false} 
          />
          {isUrlFocused && <button onClick={() => handleNavigate()} style={{ color: T.accent }}><ArrowRight className="w-4 h-4" /></button>}
        </div>

        <button onClick={triggerAutoNote} disabled={isAutoNoting || inputUrl === 'sparx://newtab'} style={{ color: isAutoNoting ? T.accent : T.textMuted, borderRadius: 6 }} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-50" title="Extract Auto-Note">
          {isAutoNoting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        </button>
        
        <button onClick={addBookmark} disabled={inputUrl === 'sparx://newtab'} style={{ color: T.textMuted, borderRadius: 6 }} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors disabled:opacity-50" title="Bookmark"><Bookmark className="w-4 h-4" /></button>
        <button onClick={() => setShowCommandPalette(true)} style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11 }} className="h-7 px-2.5 flex items-center gap-1.5 hover:bg-opacity-80 transition-colors"><Command className="w-3 h-3" /><span className="font-medium">K</span></button>
        
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsChatOpen(p => !p)} style={{ background: isChatOpen ? (isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)') : T.accentDim, color: isChatOpen ? '#fff' : T.accent, borderRadius: 8, border: `1px solid ${isChatOpen ? 'transparent' : T.border}`, }} className="h-8 px-3 flex items-center gap-2 text-xs font-semibold transition-all"><Sparkles className="w-3.5 h-3.5" />Sparx</motion.button>
        
        <div className="w-8 h-8 flex items-center justify-center transition-colors relative group" style={{ color: cloudStatus === 'synced' ? '#10b981' : cloudStatus === 'syncing' ? '#3b82f6' : cloudStatus === 'paused' ? '#f59e0b' : '#ef4444' }}>
          {cloudStatus === 'synced' ? <Cloud className="w-4 h-4" /> : cloudStatus === 'syncing' ? <Loader2 className="w-4 h-4 animate-spin" /> : cloudStatus === 'paused' ? <PauseCircle className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
          <div className="absolute top-10 right-0 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">{cloudStatus === 'synced' ? 'Data synced to Sparx Cloud' : cloudStatus === 'syncing' ? 'Syncing...' : cloudStatus === 'paused' ? 'Cloud Sync Paused (Privacy Mode)' : 'Cloud sync disconnected'}</div>
        </div>

        <button onClick={() => setIsSettingsOpen(true)} style={{ color: T.textMuted, borderRadius: 6 }} className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"><Settings className="w-4 h-4" /></button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        <div className="flex-1 relative overflow-hidden bg-white">
          {tabs.map(tab => (
            <div key={tab.id} className="absolute inset-0 w-full h-full" style={{ display: activeTabId === tab.id ? 'flex' : 'none' }}>
              {tab.url === 'sparx://newtab' ? (
                <SparxNewTab onNavigate={handleNavigate} T={T} isPrivacyMode={isPrivacyMode} />
              ) : (
                <webview 
                  id={`webview-${tab.id}`} 
                  src={tab.url} 
                  className="w-full h-full bg-white" 
                  allowpopups={true as any} 
                  webpreferences="colorScheme=light"
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isChatOpen && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 400, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 320, damping: 30 }} style={{ background: T.panelBg, borderLeft: `1px solid ${T.border}` }} className="h-full flex flex-col overflow-hidden shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10">
              <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 16px' }} className="h-12 flex items-center gap-3 shrink-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                <div><span style={{ color: T.text, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Sparx</span><span style={{ color: isPrivacyMode ? '#f59e0b' : T.textMuted, fontSize: 11, fontWeight: isPrivacyMode ? 600 : 400 }} className="ml-2">{isPrivacyMode ? 'Stealth Mode' : isDeveloperMode ? 'Dev Mode' : 'Intelligence'}</span></div>
                <StatusDot isPrivacy={isPrivacyMode} />
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  {[{ id: 'chat', icon: MessageSquare }, { id: 'workspace', icon: Library }, { id: 'bookmarks', icon: Bookmark }, { id: 'history', icon: Clock }].map(({ id, icon: Icon }) => (
                    <button key={id} onClick={() => setActivePanel(id as any)} style={{ color: activePanel === id ? T.accent : T.textMuted, background: activePanel === id ? T.accentDim : 'transparent', borderRadius: 6 }} className="w-7 h-7 flex items-center justify-center transition-colors"><Icon className="w-3.5 h-3.5" /></button>
                  ))}
                </div>
                <button onClick={() => setIsChatOpen(false)} style={{ color: T.textMuted, borderRadius: 6 }} className="w-7 h-7 flex items-center justify-center hover:bg-black/5 transition-colors ml-1"><X className="w-4 h-4" /></button>
              </div>

              {activePanel === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {chatHistory.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'ai' && <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 mr-2" style={{ background: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}><Sparkles className="w-3 h-3 text-white" /></div>}
                        <div className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm" style={msg.role === 'user' ? { background: T.userBubble, color: '#fff', borderRadius: '16px 4px 16px 16px', } : { background: T.aiBubble, border: `1px solid ${T.aiBubbleBorder}`, color: T.text, borderRadius: '4px 16px 16px 16px', }}>
                          {msg.role === 'user' ? <p className="whitespace-pre-wrap" style={{ fontSize: 13 }}>{msg.content}</p> : msg.content === '' ? <TypingIndicator color={isPrivacyMode ? '#f59e0b' : '#3b82f6'} /> : (
                            <div style={{ fontSize: 13 }}>
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => <h1 style={{ color: T.text, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{children}</h1>, h2: ({ children }) => <h2 style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{children}</h2>, h3: ({ children }) => <h3 style={{ color: T.text, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{children}</h3>, p: ({ children }) => <p style={{ marginBottom: 8, lineHeight: 1.6 }}>{children}</p>, ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'disc' }}>{children}</ul>, ol: ({ children }) => <ol style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'decimal' }}>{children}</ol>, li: ({ children }) => <li style={{ marginBottom: 3, lineHeight: 1.5 }}>{children}</li>, strong: ({ children }) => <strong style={{ color: T.text, fontWeight: 600 }}>{children}</strong>, a: ({ href, children }) => <a href={href} style={{ color: T.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}>{children}</a>,
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || ''); const codeText = String(children).replace(/\n$/, '');
                                    return !inline && match ? (
                                      <div className="relative group/code my-3 shadow-sm" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                                        <SyntaxHighlighter {...props} style={vs} language={match[1]} PreTag="div" customStyle={{ margin: 0, fontSize: 12, fontFamily: '"DM Mono", monospace', background: '#ffffff' }}>{codeText}</SyntaxHighlighter>
                                        <button onClick={() => copyToClipboard(codeText)} className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, padding: '4px 6px' }}><Copy className="w-3 h-3 text-gray-500" /></button>
                                      </div>
                                    ) : <code style={{ background: T.accentDim, color: T.accent, padding: '1px 6px', borderRadius: 4, fontFamily: '"DM Mono", monospace', fontSize: 12 }}>{children}</code>;
                                  }
                                }}
                              >{msg.content || ' '}</ReactMarkdown>
                              
                              {msg.content && (
                                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200">
                                  <button onClick={() => copyToClipboard(msg.content)} className="flex items-center gap-1.5 transition-colors hover:text-gray-900" style={{ color: T.textMuted, fontSize: 11 }}><Copy className="w-3 h-3" /> Copy</button>
                                  <button onClick={() => handleSaveToWorkspace(msg.content)} className="flex items-center gap-1.5 transition-colors hover:text-gray-900" style={{ color: T.textMuted, fontSize: 11 }}><Library className="w-3 h-3" /> Save to Workspace</button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && <div className="flex items-center gap-2" style={{ color: T.textMuted, fontSize: 12 }}><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…</div>}
                    <div ref={lastMessageRef} />
                  </div>

                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '10px 12px', background: T.surface }} className="flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {quickPrompts.map((p, i) => (
                      <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleSendMessage(p.text)} disabled={isTyping} style={{ background: T.accentDim, border: `1px solid ${T.border}`, color: T.text, borderRadius: 20, fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', padding: '6px 12px', }} className="flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"><p.icon className="w-3 h-3" style={{ color: T.accent }} />{p.label}</motion.button>
                    ))}
                  </div>

                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 14px', background: T.surface }} className="shrink-0 relative">
                    <AnimatePresence>
                      {currentMessage.startsWith('/') && filteredSlashCommands.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-4 right-4 mb-2 rounded-xl overflow-hidden shadow-lg border z-50" style={{ background: T.surface, borderColor: T.border }}>
                          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: T.textMuted, background: T.surfaceHover }}>{isDeveloperMode ? 'Developer Commands' : 'Page Commands'}</div>
                          {filteredSlashCommands.map((sc, i) => (
                            <button key={i} onClick={() => { setCurrentMessage(''); handleSendMessage(sc.text); }} className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5" style={{ color: T.text, borderBottom: i < filteredSlashCommands.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                              <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ background: T.accentDim, color: T.accent }}><sc.icon className="w-3.5 h-3.5" /></div>
                              <div className="flex-1 min-w-0"><div className="text-sm font-semibold" style={{ color: T.accent }}>{sc.cmd}</div><div className="truncate" style={{ color: T.textMuted, fontSize: 11 }}>{sc.label}</div></div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {pdfName && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg" style={{ background: T.accentDim, border: `1px solid ${T.border}` }}>
                          <div className="flex items-center gap-2" style={{ color: T.accent, fontSize: 12 }}><FileText className="w-3.5 h-3.5" /><span className="font-medium truncate">{pdfName}</span></div>
                          <button onClick={() => { setPdfName(''); setUploadedPdfText(''); }} style={{ color: T.textMuted }}><X className="w-3.5 h-3.5" /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div className="relative flex items-end gap-2 rounded-xl px-3 py-2 z-10 shadow-sm transition-shadow focus-within:shadow-md" style={{ background: T.inputBg, border: `1px solid ${T.border}` }}>
                      <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e.target.files?.[0])} accept=".pdf" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} disabled={isTyping || isUploading} style={{ color: T.textMuted }} className="p-1 transition-colors mt-1 hover:text-gray-900"><Paperclip className="w-4 h-4" /></button>
                      <textarea value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder={pdfName ? 'Ask about your document…' : 'Type "/" for commands...'} disabled={isTyping || isUploading} rows={1} className="flex-1 bg-transparent outline-none resize-none" style={{ color: T.text, fontSize: 13, lineHeight: '1.5', minHeight: 24, maxHeight: 120, caretColor: T.accent }} />
                      <button onClick={() => handleSendMessage()} disabled={isTyping || isUploading || !currentMessage.trim()} className="p-2 rounded-lg transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shrink-0 shadow-sm" style={{ background: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff' }}><ArrowRight className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex items-center justify-between mt-2 px-1">
                      <span style={{ color: T.textMuted, fontSize: 10 }}>Enter to send · Shift+Enter for newline</span>
                      <button onClick={clearChat} style={{ color: T.textMuted, fontSize: 10 }} className="flex items-center gap-1 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /> Clear</button>
                    </div>
                  </div>
                </>
              )}

              {/* WORKSPACE PANEL UI */}
              {activePanel === 'workspace' && (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-6">
                    <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Knowledge Workspace</div>
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold border" style={{ background: T.accentDim, color: T.accent, borderColor: T.accent }}>{isPrivacyMode ? 'Local Only' : 'Auto-Synced'}</div>
                  </div>
                  
                  {safeNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-center px-4 border border-dashed rounded-xl bg-white" style={{ borderColor: T.border }}>
                      <Library className="w-8 h-8 mb-3 opacity-20" style={{ color: T.text }} />
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>Your workspace is empty.</p>
                      <p style={{ color: T.textMuted, fontSize: 12, marginTop: 4 }}>Ask the AI to research a topic, then click "Save to Workspace" on the message.</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    {safeNotes.map(note => (
                      <motion.div key={note.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border relative group shadow-sm" style={{ background: T.surface, borderColor: T.border }}>
                        <button onClick={() => { if(setNotes) setNotes(p => { const arr = Array.isArray(p) ? p : []; return arr.filter(n => n.id !== note.id); })}} className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                        <h3 className="font-semibold mb-2 pr-8" style={{ color: T.text, fontSize: 15 }}>{note.title || 'Untitled'}</h3>
                        <div className="text-sm opacity-80" style={{ color: T.textDim, fontSize: 11, marginBottom: 12 }}>{new Date(note.timestamp || Date.now()).toLocaleString()}</div>
                        
                        <div className="max-h-40 overflow-y-auto no-scrollbar rounded-lg p-3 text-sm" style={{ background: T.bg, border: `1px solid ${T.borderMuted}`, color: T.text }}>
                          <ReactMarkdown
                             components={{
                               h1: ({ children }) => <h1 style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{children}</h1>,
                               h2: ({ children }) => <h2 style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{children}</h2>,
                               p: ({ children }) => <p style={{ marginBottom: 6, lineHeight: 1.5 }}>{children}</p>,
                               ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 6, listStyle: 'disc' }}>{children}</ul>,
                               li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                             }}
                          >{note.content || ' '}</ReactMarkdown>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'bookmarks' && (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                  <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Bookmarks</div>
                  {bookmarks.length === 0 && <p style={{ color: T.textMuted, fontSize: 13 }}>No bookmarks yet.</p>}
                  {bookmarks.map((b, i) => (
                    <button key={i} onClick={() => { handleNavigate(b.url); setActivePanel('chat'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1" style={{ color: T.text, fontSize: 13 }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Globe style={{ color: T.textMuted }} className="w-4 h-4 shrink-0" /><div className="flex-1 min-w-0"><div className="font-medium truncate">{b.title}</div><div style={{ color: T.textMuted, fontSize: 11 }} className="truncate">{b.url}</div></div><ExternalLink style={{ color: T.textMuted }} className="w-3 h-3 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {activePanel === 'history' && (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                  <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Recent History</div>
                  {history.length === 0 && <p style={{ color: T.textMuted, fontSize: 13 }}>{isPrivacyMode ? 'History is paused.' : 'No history yet.'}</p>}
                  {history.map((h, i) => (
                    <button key={i} onClick={() => handleNavigate(h.url)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1" style={{ color: T.text, fontSize: 13 }} onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Clock style={{ color: T.textMuted }} className="w-4 h-4 shrink-0" /><div className="flex-1 min-w-0"><div className="font-medium truncate">{h.title}</div><div style={{ color: T.textMuted, fontSize: 11 }} className="truncate">{h.url}</div></div>
                    </button>
                  ))}
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* COMMAND PALETTE */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCommandPalette(false)} className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }} className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[600px] rounded-2xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                {commandQuery.toLowerCase().startsWith('open ') ? <Globe className="w-4 h-4 shrink-0 text-blue-500" /> : commandQuery.toLowerCase().startsWith('search ') ? <Search className="w-4 h-4 shrink-0 text-green-500" /> : <Command className="w-4 h-4 shrink-0" style={{ color: T.accent }} />}
                <input ref={commandInputRef} type="text" value={commandQuery} onChange={e => setCommandQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setShowCommandPalette(false); if (e.key === 'Enter' && commandQuery) executeCommand(commandQuery); }} placeholder="Type a command (e.g., 'open youtube', '/agent', 'workspace')" className="flex-1 bg-transparent outline-none text-base font-medium" style={{ color: T.text }} />
                <kbd style={{ background: T.surfaceHover, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: '2px 6px', fontSize: 10 }}>ESC</kbd>
              </div>
              <div className="py-2 max-h-[360px] overflow-y-auto bg-gray-50/50">
                <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 20px 4px' }}>Suggestions</div>
                
                {isDeveloperMode && (commandQuery === '' || 'debug'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('debug')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Bug className="w-4 h-4 shrink-0 text-red-500" /><span style={{ color: T.text, fontSize: 13 }}>Debug current page code</span>
                  </button>
                )}
                {isDeveloperMode && (commandQuery === '' || 'refactor'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('refactor')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Terminal className="w-4 h-4 shrink-0 text-green-500" /><span style={{ color: T.text, fontSize: 13 }}>Refactor current page code</span>
                  </button>
                )}

                {(commandQuery === '' || 'agent'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('agent ')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Bot className="w-4 h-4 shrink-0 text-blue-500" /><span style={{ color: T.text, fontSize: 13 }}>Launch Autonomous Agent...</span>
                  </button>
                )}
                {(commandQuery === '' || 'extract'.includes(commandQuery.toLowerCase()) || 'note'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('auto note')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Wand2 className="w-4 h-4 shrink-0 text-yellow-500" /><span style={{ color: T.text, fontSize: 13 }}>Auto-Extract page to Workspace</span>
                  </button>
                )}
                {(commandQuery === '' || 'workspace'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('workspace')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Library className="w-4 h-4 shrink-0 text-purple-500" /><span style={{ color: T.text, fontSize: 13 }}>Open Knowledge Workspace</span>
                  </button>
                )}
                {(commandQuery === '' || 'compare'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('compare')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Columns className="w-4 h-4 shrink-0 text-pink-500" /><span style={{ color: T.text, fontSize: 13 }}>Compare all open tabs</span>
                  </button>
                )}
                {(commandQuery === '' || 'summarize'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('summarize')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Sparkles className="w-4 h-4 shrink-0" style={{ color: T.accent }} /><span style={{ color: T.text, fontSize: 13 }}>Summarize current page</span>
                  </button>
                )}
                {commandQuery.toLowerCase().startsWith('open ') && commandQuery.length > 5 && (
                  <button onClick={() => executeCommand(commandQuery)} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Globe className="w-4 h-4 shrink-0 text-blue-500" /><span style={{ color: T.text, fontSize: 13 }}>Go to <strong>{commandQuery.replace('open ', '')}.com</strong></span>
                  </button>
                )}
                {commandQuery.toLowerCase().startsWith('search ') && commandQuery.length > 7 && (
                  <button onClick={() => executeCommand(commandQuery)} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Search className="w-4 h-4 shrink-0 text-green-500" /><span style={{ color: T.text, fontSize: 13 }}>Search Google for <strong>"{commandQuery.replace('search ', '')}"</strong></span>
                  </button>
                )}
                {(commandQuery === '' || 'bookmark'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('bookmark')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Bookmark className="w-4 h-4 shrink-0" style={{ color: T.textMuted }} /><span style={{ color: T.text, fontSize: 13 }}>Bookmark this page</span>
                  </button>
                )}
                {(commandQuery === '' || 'settings'.includes(commandQuery.toLowerCase())) && (
                  <button onClick={() => executeCommand('settings')} className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item" onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <Settings className="w-4 h-4 shrink-0" style={{ color: T.textMuted }} /><span style={{ color: T.text, fontSize: 13 }}>Open Settings</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SETTINGS OVERLAY */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="fixed inset-0 z-50" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(2px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] rounded-2xl p-6 flex flex-col gap-6" style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900"><Settings className="w-5 h-5" style={{ color: T.accent }} /> Sparx Settings</h2>
                <button onClick={() => setIsSettingsOpen(false)} style={{ color: T.textMuted }} className="p-1 hover:bg-black/5 rounded-md transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Cloud Profile */}
              <div className="flex flex-col gap-3 p-4 rounded-xl border" style={{ borderColor: T.border, background: T.surfaceHover }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600"><Cloud className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Cloud Account</div>
                    <div style={{ color: T.textMuted, fontSize: 12 }}>{user?.email}</div>
                  </div>
                  <button onClick={() => { logout(); setIsSettingsOpen(false); }} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors bg-white">Sign Out</button>
                </div>
              </div>

              {/* PRIVACY SHIELD TOGGLE */}
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: T.border, background: isPrivacyMode ? 'rgba(245, 158, 11, 0.05)' : T.surfaceHover }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPrivacyMode ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                    {isPrivacyMode ? <EyeOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Privacy Shield (Incognito)</div>
                    <div style={{ color: T.textMuted, fontSize: 12 }}>{isPrivacyMode ? "Active. Sync paused & history disabled." : "Off. Syncing to secure cloud."}</div>
                  </div>
                </div>
                <button onClick={() => setIsPrivacyMode(!isPrivacyMode)} className={`w-12 h-6 rounded-full relative transition-colors ${isPrivacyMode ? 'bg-amber-500' : 'bg-gray-300'}`}>
                  <motion.div layout className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" style={{ left: isPrivacyMode ? '28px' : '4px' }} />
                </button>
              </div>

              {/* DEVELOPER MODE TOGGLE */}
              <div className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: T.border, background: isDeveloperMode ? 'rgba(168, 85, 247, 0.05)' : T.surfaceHover }}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDeveloperMode ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">Developer Mode</div>
                    <div style={{ color: T.textMuted, fontSize: 12 }}>Unlocks code debugging & refactoring.</div>
                  </div>
                </div>
                <button onClick={() => setIsDeveloperMode(!isDeveloperMode)} className={`w-12 h-6 rounded-full relative transition-colors ${isDeveloperMode ? 'bg-purple-500' : 'bg-gray-300'}`}>
                  <motion.div layout className="w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm" style={{ left: isDeveloperMode ? '28px' : '4px' }} />
                </button>
              </div>

              {/* AI Engine Model */}
              <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: T.textMuted }}><Cpu className="w-4 h-4" /> AI Engine Model</label>
                <select value={aiModel} onChange={e => setAiModel(e.target.value)} className="w-full p-3 rounded-lg text-sm outline-none cursor-pointer appearance-none shadow-sm" style={{ background: T.inputBg, border: `1px solid ${T.border}`, color: T.text }}>
                  <option value="llama3">Meta Llama 3 (8B) - Balanced</option>
                  <option value="phi3">Microsoft Phi-3 (3B) - Fast</option>
                  <option value="mistral">Mistral (7B) - Coding</option>
                </select>
                <span style={{ fontSize: 11, color: T.textDim }}>*Requires you to download the model locally via `ollama pull [model]`</span>
              </div>

              {/* Memory Management */}
              <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: T.border }}>
                <label className="text-sm font-medium flex items-center gap-2" style={{ color: T.textMuted }}><Database className="w-4 h-4" /> Vector Database</label>
                <p style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>Clear all saved PDFs and documents from Sparx's local ChromaDB memory.</p>
                <button onClick={onWipeMemoryClick} className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
                  <Trash2 className="w-4 h-4" /> Wipe AI Memory
                </button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}