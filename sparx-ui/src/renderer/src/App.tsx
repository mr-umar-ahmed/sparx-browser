import React, {
  useState,
  ReactElement,
  KeyboardEvent,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Settings, ArrowRight, Plus, X,
  Loader2, FileText, Code, Zap, Paperclip, Copy, Trash2,
  ChevronLeft, ChevronRight, RotateCw, Shield, Star,
  BookOpen, Clock, Globe, Command, LayoutGrid, Moon, Sun,
  MessageSquare, SidebarClose, SidebarOpen, Home,
  ExternalLink, Pin, Bookmark, Share2, MoreHorizontal,
  Download, PanelRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  pinned?: boolean;
  isLoading?: boolean;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp?: Date;
}

interface BookmarkItem {
  title: string;
  url: string;
}

/* ─────────────────────────────────────────────
   FAVICON HELPER
───────────────────────────────────────────── */
const getFavicon = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return null;
  }
};

/* ─────────────────────────────────────────────
   PULSING STATUS DOT
───────────────────────────────────────────── */
const StatusDot = (): ReactElement => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
  </span>
);

/* ─────────────────────────────────────────────
   TYPING INDICATOR
───────────────────────────────────────────── */
const TypingIndicator = (): ReactElement => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="block w-1.5 h-1.5 rounded-full bg-[#c084fc]"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */
function App(): ReactElement {
  /* ── Browser State ── */
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'New Tab', url: 'https://www.google.com', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [inputUrl, setInputUrl] = useState<string>('https://www.google.com');
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [isDark, setIsDark] = useState(true);

  /* ── UI State ── */
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'chat' | 'history' | 'bookmarks'>('chat');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  /* ── Chat State ── */
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedPdfText, setUploadedPdfText] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: `## Welcome to Sparx ✦\n\nI'm your intelligent browsing companion. I can:\n\n- **Summarize** any page you're viewing\n- **Explain code** snippets step-by-step\n- **Answer questions** about uploaded PDFs\n- **Extract action items** from documents\n\nWhat would you like to explore?`,
      timestamp: new Date()
    }
  ]);

  /* ── Bookmarks / History ── */
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
    { title: 'Anthropic', url: 'https://anthropic.com' },
    { title: 'GitHub', url: 'https://github.com' },
  ]);
  const [history] = useState<BookmarkItem[]>([
    { title: 'Google', url: 'https://google.com' },
  ]);

  /* ── Refs ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  /* ── Effects ── */
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatHistory, isTyping]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      }
      if (e.key === 'Escape') setShowCommandPalette(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* ── Theme tokens ── */
  const T = useMemo(() => isDark ? {
    bg: '#0e0e11',
    surface: '#18181c',
    surfaceHover: '#222228',
    border: '#2a2a35',
    borderMuted: '#1f1f28',
    text: '#e8e8f0',
    textMuted: '#6b6b80',
    textDim: '#3d3d50',
    accent: '#c084fc',
    accentDim: 'rgba(192,132,252,0.12)',
    accentDimHover: 'rgba(192,132,252,0.2)',
    userBubble: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    aiBubble: '#1e1e26',
    aiBubbleBorder: '#2a2a38',
    tabActive: '#1e1e28',
    tabHover: '#18181f',
    inputBg: '#131318',
    urlBg: '#131318',
    urlFocusBorder: '#7c3aed',
    sidebarBg: '#0c0c10',
    panelBg: '#111116',
    shadow: '0 25px 60px rgba(0,0,0,0.7)',
    shadowSm: '0 4px 20px rgba(0,0,0,0.4)',
  } : {
    bg: '#f5f5f7',
    surface: '#ffffff',
    surfaceHover: '#f8f8fc',
    border: '#e2e2ea',
    borderMuted: '#ebebf2',
    text: '#111118',
    textMuted: '#6b6b80',
    textDim: '#c0c0cc',
    accent: '#7c3aed',
    accentDim: 'rgba(124,58,237,0.08)',
    accentDimHover: 'rgba(124,58,237,0.15)',
    userBubble: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    aiBubble: '#f8f8fc',
    aiBubbleBorder: '#e2e2ea',
    tabActive: '#ffffff',
    tabHover: '#f5f5fa',
    inputBg: '#f2f2f6',
    urlBg: '#f2f2f6',
    urlFocusBorder: '#7c3aed',
    sidebarBg: '#ededf2',
    panelBg: '#f8f8fc',
    shadow: '0 25px 60px rgba(0,0,0,0.12)',
    shadowSm: '0 4px 20px rgba(0,0,0,0.08)',
  }, [isDark]);

  /* ─────────── TAB HANDLERS ─────────── */
  const handleAddTab = useCallback(() => {
    const id = Date.now().toString();
    setTabs(p => [...p, { id, title: 'New Tab', url: 'https://www.google.com' }]);
    setActiveTabId(id);
    setInputUrl('https://www.google.com');
  }, []);

  const handleCloseTab = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTabId === id) {
      setActiveTabId(next[next.length - 1].id);
      setInputUrl(next[next.length - 1].url);
    }
  }, [tabs, activeTabId]);

  const handleSwitchTab = useCallback((tab: Tab) => {
    setActiveTabId(tab.id);
    setInputUrl(tab.url);
  }, []);

  const handlePinTab = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTabs(p => p.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t));
  }, []);

  const handleNavigate = useCallback((e?: { key: string }) => {
    if (e && e.key !== 'Enter') return;
    let url = inputUrl.trim();
    if (!url) return;
    if (!url.includes('.') || url.includes(' ')) {
      url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    } else if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    const title = (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url.slice(0, 24); } })();
    setTabs(p => p.map(t => t.id === activeTabId ? { ...t, url, title, favicon: getFavicon(url) ?? undefined } : t));
    setInputUrl(url);
    urlInputRef.current?.blur();
  }, [inputUrl, activeTabId]);

  const addBookmark = useCallback(() => {
    const active = tabs.find(t => t.id === activeTabId);
    if (!active) return;
    setBookmarks(p => [...p, { title: active.title, url: active.url }]);
  }, [tabs, activeTabId]);

  /* ─────────── CHAT HANDLERS ─────────── */
  const getActivePageText = async (): Promise<string> => {
    const webview = document.getElementById(`webview-${activeTabId}`) as any;
    if (!webview?.executeJavaScript) return '';
    try {
      const text = await webview.executeJavaScript('document.body.innerText');
      return text ? text.substring(0, 8000) : '';
    } catch { return ''; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return;
    setPdfName(file.name);
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/extract-pdf', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setUploadedPdfText(data.text);
        setChatHistory(p => [...p, { role: 'ai', content: `**${file.name}** loaded successfully.\n\nWhat would you like to know about this document?`, timestamp: new Date() }]);
      } else throw new Error(data.error || 'Unknown error');
    } catch (err) {
      setChatHistory(p => [...p, { role: 'ai', content: `Could not read the PDF. ${err instanceof Error ? err.message : 'Please try again.'}`, timestamp: new Date() }]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (override?: string) => {
    const msg = (override || currentMessage).trim();
    if (!msg || isTyping) return;
    setChatHistory(p => [...p, { role: 'user', content: msg, timestamp: new Date() }, { role: 'ai', content: '', timestamp: new Date() }]);
    setCurrentMessage('');
    setIsTyping(true);
    try {
      const ctx = uploadedPdfText || await getActivePageText();
      const res = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, context: ctx }),
      });
      if (!res.ok || !res.body) throw new Error('Stream failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: rd } = await reader.read();
        done = rd;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setChatHistory(p => { const u = [...p]; u[u.length - 1].content += chunk; return u; });
        }
      }
    } catch {
      setChatHistory(p => { const u = [...p]; u[u.length - 1].content = 'Connection lost. Please try again.'; return u; });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => setChatHistory([{
    role: 'ai',
    content: '## Fresh start ✦\n\nReady for your next question.',
    timestamp: new Date()
  }]);

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  /* ─────────── QUICK PROMPTS ─────────── */
  const quickPrompts = useMemo(() => [
    { icon: FileText, label: 'Summarize', text: 'Summarize the key points of this page in 3-5 concise bullet points.' },
    { icon: Code, label: 'Explain Code', text: 'Explain every code snippet on this page clearly with analogies.' },
    { icon: Zap, label: 'Key Actions', text: 'List all actionable items, deadlines, and next steps.' },
    { icon: Search, label: 'Fact Check', text: 'Identify any claims that might need verification or seem incorrect.' },
  ], []);

  /* ─────────── ACTIVE TAB ─────────── */
  const activeTab = tabs.find(t => t.id === activeTabId);

  /* ─────────── CSS VARS ─────────── */
  const cssVars: React.CSSProperties = {
    '--bg': T.bg,
    '--surface': T.surface,
    '--border': T.border,
    '--text': T.text,
    '--text-muted': T.textMuted,
    '--accent': T.accent,
    '--accent-dim': T.accentDim,
  } as React.CSSProperties;

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div
      style={{ ...cssVars, background: T.bg, color: T.text, fontFamily: '"DM Sans", system-ui, sans-serif' }}
      className="h-screen w-full overflow-hidden flex flex-col select-none"
    >
      {/* ══ GOOGLE FONTS ══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.textMuted}; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* URL bar protocol badge */
        .proto-badge { font-family: 'DM Mono', monospace; }

        /* Tab strip shadow */
        .tab-strip-shadow { box-shadow: inset 0 -1px 0 ${T.border}; }

        /* Frosted glass */
        .frosted { backdrop-filter: blur(20px) saturate(180%); }

        /* Animate suggestion items */
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .suggestion-item { animation: fadeSlideIn 0.15s ease forwards; }
      `}</style>

      {/* ══════════════════════════════════════
          TOP CHROME: TAB BAR
      ══════════════════════════════════════ */}
      <div
        style={{ background: T.sidebarBg, borderBottom: `1px solid ${T.border}` }}
        className="flex items-end h-11 px-2 gap-0.5 shrink-0 frosted"
      >
        {/* Sorted: pinned first */}
        {[...tabs.filter(t => t.pinned), ...tabs.filter(t => !t.pinned)].map(tab => (
          <motion.div
            key={tab.id}
            layout
            initial={{ opacity: 0, scaleX: 0.85 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0.85 }}
            onClick={() => handleSwitchTab(tab)}
            className="group relative flex items-center gap-2 cursor-pointer"
            style={{
              minWidth: tab.pinned ? 40 : 120,
              maxWidth: tab.pinned ? 40 : 220,
              height: 36,
              padding: tab.pinned ? '0 10px' : '0 12px',
              borderRadius: '8px 8px 0 0',
              background: activeTabId === tab.id ? T.surface : 'transparent',
              borderTop: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent',
              borderLeft: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent',
              borderRight: activeTabId === tab.id ? `1px solid ${T.border}` : '1px solid transparent',
              borderBottom: activeTabId === tab.id ? `1px solid ${T.surface}` : 'none',
              marginBottom: activeTabId === tab.id ? -1 : 0,
            }}
          >
            {/* Favicon */}
            {tab.favicon ? (
              <img src={tab.favicon} className="w-4 h-4 shrink-0 rounded" alt="" onError={e => (e.currentTarget.style.display = 'none')} />
            ) : (
              <Globe style={{ color: T.textMuted }} className="w-3.5 h-3.5 shrink-0" />
            )}

            {!tab.pinned && (
              <>
                <span style={{ color: activeTabId === tab.id ? T.text : T.textMuted, fontSize: 12, fontWeight: 500 }}
                  className="truncate flex-1">
                  {tab.isLoading ? 'Loading…' : tab.title}
                </span>
                <button
                  onClick={e => handleCloseTab(e, tab.id)}
                  style={{ color: T.textMuted, borderRadius: 4 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400 p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            )}

            {/* Active tab bottom cover */}
            {activeTabId === tab.id && (
              <div style={{ background: T.surface }} className="absolute bottom-0 left-0 right-0 h-px" />
            )}
          </motion.div>
        ))}

        <button
          onClick={handleAddTab}
          style={{ color: T.textMuted, borderRadius: 6 }}
          className="flex items-center justify-center w-7 h-7 mb-0.5 hover:bg-white/10 transition-colors ml-1"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(p => !p)}
          style={{ color: T.textMuted, borderRadius: 6 }}
          className="flex items-center justify-center w-7 h-7 mb-1.5 hover:bg-white/10 transition-colors mr-1"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ══════════════════════════════════════
          NAVIGATION BAR (URL Bar)
      ══════════════════════════════════════ */}
      <div
        style={{ background: T.surface, borderBottom: `1px solid ${T.border}` }}
        className="h-12 flex items-center px-3 gap-2 shrink-0"
      >
        {/* Back / Forward / Reload */}
        <div className="flex items-center gap-0.5">
          {[
            { icon: ChevronLeft, disabled: !canGoBack },
            { icon: ChevronRight, disabled: !canGoForward },
            { icon: RotateCw, disabled: false },
          ].map(({ icon: Icon, disabled }, i) => (
            <button
              key={i}
              disabled={disabled}
              style={{ color: disabled ? T.textDim : T.textMuted, borderRadius: 6 }}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/8 disabled:cursor-not-allowed transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* HOME */}
        <button
          onClick={() => { setInputUrl('https://www.google.com'); setTimeout(() => handleNavigate(), 10); }}
          style={{ color: T.textMuted, borderRadius: 6 }}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/8 transition-colors"
        >
          <Home className="w-4 h-4" />
        </button>

        {/* URL BAR */}
        <div
          className="flex-1 flex items-center gap-2 h-8 px-3 rounded-lg transition-all"
          style={{
            background: T.urlBg,
            border: `1px solid ${isUrlFocused ? T.urlFocusBorder : T.border}`,
            boxShadow: isUrlFocused ? `0 0 0 3px ${T.accentDim}` : 'none',
          }}
        >
          {/* Protocol badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Shield className="w-3 h-3" style={{ color: inputUrl.startsWith('https') ? '#10b981' : T.textMuted }} />
          </div>

          <input
            ref={urlInputRef}
            type="text"
            value={isUrlFocused ? inputUrl : (() => { try { return new URL(inputUrl).hostname.replace('www.', ''); } catch { return inputUrl; } })()}
            onChange={e => setInputUrl(e.target.value)}
            onFocus={() => { setIsUrlFocused(true); setTimeout(() => urlInputRef.current?.select(), 10); }}
            onBlur={() => setIsUrlFocused(false)}
            onKeyDown={handleNavigate}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: T.text, fontFamily: isUrlFocused ? '"DM Mono", monospace' : '"DM Sans", sans-serif', fontSize: 13 }}
            placeholder="Search or enter URL…"
            spellCheck={false}
          />

          {/* Go button */}
          {isUrlFocused && (
            <button onClick={() => handleNavigate()} style={{ color: T.accent }}>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={addBookmark}
          style={{ color: T.textMuted, borderRadius: 6 }}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/8 transition-colors"
          title="Bookmark"
        >
          <Bookmark className="w-4 h-4" />
        </button>

        {/* Command palette trigger */}
        <button
          onClick={() => setShowCommandPalette(true)}
          style={{ background: T.accentDim, color: T.accent, border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 11 }}
          className="h-7 px-2.5 flex items-center gap-1.5 hover:bg-opacity-80 transition-colors"
        >
          <Command className="w-3 h-3" />
          <span className="font-medium">K</span>
        </button>

        {/* Sparx toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(p => !p)}
          style={{
            background: isChatOpen
              ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
              : T.accentDim,
            color: isChatOpen ? '#fff' : T.accent,
            borderRadius: 8,
            border: `1px solid ${isChatOpen ? 'transparent' : T.border}`,
          }}
          className="h-8 px-3 flex items-center gap-2 text-xs font-semibold transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Sparx
        </motion.button>

        <button
          style={{ color: T.textMuted, borderRadius: 6 }}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/8 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── WEBVIEW AREA ── */}
        <div className="flex-1 relative overflow-hidden">
          {tabs.map(tab => (
            <webview
              key={tab.id}
              id={`webview-${tab.id}`}
              src={tab.url}
              className="absolute inset-0 w-full h-full"
              style={{
                display: activeTabId === tab.id ? 'flex' : 'none',
              }}
              // @ts-ignore
              allowpopups="true"
            />
          ))}
        </div>

        {/* ══════════════════════════════════════
            SPARX PANEL
        ══════════════════════════════════════ */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ background: T.panelBg, borderLeft: `1px solid ${T.border}` }}
              className="h-full flex flex-col overflow-hidden shrink-0"
            >
              {/* Panel Header */}
              <div
                style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '0 16px' }}
                className="h-12 flex items-center gap-3 shrink-0"
              >
                {/* Logo mark */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>

                <div>
                  <span style={{ color: T.text, fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>Sparx</span>
                  <span style={{ color: T.textMuted, fontSize: 11 }} className="ml-2">Intelligence</span>
                </div>

                <StatusDot />
                <div className="flex-1" />

                {/* Panel tabs */}
                <div className="flex items-center gap-1">
                  {[
                    { id: 'chat', icon: MessageSquare },
                    { id: 'bookmarks', icon: Bookmark },
                    { id: 'history', icon: Clock },
                  ].map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActivePanel(id as any)}
                      style={{
                        color: activePanel === id ? T.accent : T.textMuted,
                        background: activePanel === id ? T.accentDim : 'transparent',
                        borderRadius: 6,
                      }}
                      className="w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsChatOpen(false)}
                  style={{ color: T.textMuted, borderRadius: 6 }}
                  className="w-7 h-7 flex items-center justify-center hover:bg-white/8 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── CHAT PANEL ── */}
              {activePanel === 'chat' && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                    {chatHistory.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.03, 0.3) }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* AI avatar */}
                        {msg.role === 'ai' && (
                          <div
                            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 mr-2"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}

                        <div
                          className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                          style={msg.role === 'user' ? {
                            background: T.userBubble,
                            color: '#fff',
                            borderRadius: '16px 4px 16px 16px',
                          } : {
                            background: T.aiBubble,
                            border: `1px solid ${T.aiBubbleBorder}`,
                            color: T.text,
                            borderRadius: '4px 16px 16px 16px',
                          }}
                        >
                          {msg.role === 'user' ? (
                            <p className="whitespace-pre-wrap" style={{ fontSize: 13 }}>{msg.content}</p>
                          ) : msg.content === '' ? (
                            <TypingIndicator />
                          ) : (
                            <div style={{ fontSize: 13 }}>
                              <ReactMarkdown
                                components={{
                                  h1: ({ children }) => <h1 style={{ color: T.text, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{children}</h1>,
                                  h2: ({ children }) => <h2 style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{children}</h2>,
                                  h3: ({ children }) => <h3 style={{ color: T.text, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{children}</h3>,
                                  p: ({ children }) => <p style={{ marginBottom: 8, lineHeight: 1.6 }}>{children}</p>,
                                  ul: ({ children }) => <ul style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'disc' }}>{children}</ul>,
                                  ol: ({ children }) => <ol style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'decimal' }}>{children}</ol>,
                                  li: ({ children }) => <li style={{ marginBottom: 3, lineHeight: 1.5 }}>{children}</li>,
                                  strong: ({ children }) => <strong style={{ color: T.text, fontWeight: 600 }}>{children}</strong>,
                                  a: ({ href, children }) => (
                                    <a href={href} style={{ color: T.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}>{children}</a>
                                  ),
                                  code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const codeText = String(children).replace(/\n$/, '');
                                    return !inline && match ? (
                                      <div className="relative group/code my-3" style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${T.border}` }}>
                                        <SyntaxHighlighter
                                          {...props}
                                          style={vscDarkPlus}
                                          language={match[1]}
                                          PreTag="div"
                                          customStyle={{ margin: 0, fontSize: 12, fontFamily: '"DM Mono", monospace', background: '#0d0d14' }}
                                        >
                                          {codeText}
                                        </SyntaxHighlighter>
                                        <button
                                          onClick={() => copyToClipboard(codeText)}
                                          className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                                          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, padding: '4px 6px' }}
                                        >
                                          <Copy className="w-3 h-3 text-white/70" />
                                        </button>
                                      </div>
                                    ) : (
                                      <code
                                        style={{ background: T.accentDim, color: T.accent, padding: '1px 6px', borderRadius: 4, fontFamily: '"DM Mono", monospace', fontSize: 12 }}
                                      >{children}</code>
                                    );
                                  }
                                }}
                              >
                                {msg.content || ' '}
                              </ReactMarkdown>

                              {/* Copy message */}
                              {msg.content && (
                                <button
                                  onClick={() => copyToClipboard(msg.content)}
                                  className="mt-2 flex items-center gap-1.5 transition-colors"
                                  style={{ color: T.textMuted, fontSize: 11 }}
                                >
                                  <Copy className="w-3 h-3" />
                                  Copy
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-2" style={{ color: T.textMuted, fontSize: 12 }}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Thinking…
                      </div>
                    )}

                    <div ref={lastMessageRef} />
                  </div>

                  {/* Quick Prompts */}
                  <div
                    style={{ borderTop: `1px solid ${T.border}`, padding: '10px 12px' }}
                    className="flex gap-2 overflow-x-auto no-scrollbar shrink-0"
                  >
                    {quickPrompts.map((p, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSendMessage(p.text)}
                        disabled={isTyping}
                        style={{
                          background: T.accentDim,
                          border: `1px solid ${T.border}`,
                          color: T.text,
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 500,
                          whiteSpace: 'nowrap',
                          padding: '6px 12px',
                        }}
                        className="flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                      >
                        <p.icon className="w-3 h-3" style={{ color: T.accent }} />
                        {p.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: '12px 14px' }} className="shrink-0">
                    <AnimatePresence>
                      {pdfName && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg"
                          style={{ background: T.accentDim, border: `1px solid ${T.border}` }}
                        >
                          <div className="flex items-center gap-2" style={{ color: T.accent, fontSize: 12 }}>
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-medium truncate">{pdfName}</span>
                          </div>
                          <button onClick={() => { setPdfName(''); setUploadedPdfText(''); }} style={{ color: T.textMuted }}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div
                      className="flex items-end gap-2 rounded-xl px-3 py-2"
                      style={{ background: T.inputBg, border: `1px solid ${T.border}` }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf"
                        className="hidden"
                      />

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isTyping || isUploading}
                        style={{ color: T.textMuted }}
                        className="p-1 hover:text-purple-400 transition-colors mt-1"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>

                      <textarea
                        value={currentMessage}
                        onChange={e => setCurrentMessage(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={pdfName ? 'Ask about your document…' : 'Ask anything about this page…'}
                        disabled={isTyping || isUploading}
                        rows={1}
                        className="flex-1 bg-transparent outline-none resize-none"
                        style={{
                          color: T.text,
                          fontSize: 13,
                          lineHeight: '1.5',
                          minHeight: 24,
                          maxHeight: 120,
                          caretColor: T.accent,
                        }}
                      />

                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isTyping || isUploading || !currentMessage.trim()}
                        className="p-2 rounded-lg transition-all disabled:opacity-40 hover:scale-105 active:scale-95 shrink-0"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff' }}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 px-1">
                      <span style={{ color: T.textMuted, fontSize: 10 }}>
                        Enter to send · Shift+Enter for newline
                      </span>
                      <button
                        onClick={clearChat}
                        style={{ color: T.textMuted, fontSize: 10 }}
                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── BOOKMARKS PANEL ── */}
              {activePanel === 'bookmarks' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Bookmarks
                  </div>
                  {bookmarks.length === 0 && (
                    <p style={{ color: T.textMuted, fontSize: 13 }}>No bookmarks yet. Click the bookmark icon in the nav bar to save pages.</p>
                  )}
                  {bookmarks.map((b, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputUrl(b.url); setActivePanel('chat'); setTimeout(() => handleNavigate(), 20); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1"
                      style={{ color: T.text, fontSize: 13 }}
                      onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Globe style={{ color: T.textMuted }} className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{b.title}</div>
                        <div style={{ color: T.textMuted, fontSize: 11 }} className="truncate">{b.url}</div>
                      </div>
                      <ExternalLink style={{ color: T.textMuted }} className="w-3 h-3 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* ── HISTORY PANEL ── */}
              {activePanel === 'history' && (
                <div className="flex-1 overflow-y-auto p-4">
                  <div style={{ color: T.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                    Recent History
                  </div>
                  {history.map((h, i) => (
                    <button
                      key={i}
                      onClick={() => { setInputUrl(h.url); setTimeout(() => handleNavigate(), 20); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1"
                      style={{ color: T.text, fontSize: 13 }}
                      onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Clock style={{ color: T.textMuted }} className="w-4 h-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{h.title}</div>
                        <div style={{ color: T.textMuted, fontSize: 11 }} className="truncate">{h.url}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════
          COMMAND PALETTE
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {showCommandPalette && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCommandPalette(false)}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-[560px] rounded-2xl overflow-hidden"
              style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
            >
              {/* Search input */}
              <div
                className="flex items-center gap-3 px-5 py-4"
                style={{ borderBottom: `1px solid ${T.border}` }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: T.textMuted }} />
                <input
                  autoFocus
                  type="text"
                  value={commandQuery}
                  onChange={e => setCommandQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Escape') setShowCommandPalette(false);
                    if (e.key === 'Enter' && commandQuery) {
                      setInputUrl(commandQuery);
                      setShowCommandPalette(false);
                      setTimeout(() => handleNavigate(), 10);
                    }
                  }}
                  placeholder="Search the web or enter a URL…"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: T.text, fontSize: 15 }}
                />
                <kbd style={{ background: T.surfaceHover, color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: '2px 6px', fontSize: 10 }}>
                  ESC
                </kbd>
              </div>

              {/* Suggestions */}
              <div className="py-2 max-h-[360px] overflow-y-auto">
                <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '8px 20px 4px' }}>
                  Quick Actions
                </div>
                {[
                  { icon: Globe, label: 'New Tab', action: () => { handleAddTab(); setShowCommandPalette(false); } },
                  { icon: Bookmark, label: 'Bookmark this page', action: () => { addBookmark(); setShowCommandPalette(false); } },
                  { icon: MessageSquare, label: 'Ask Sparx about this page', action: () => { setIsChatOpen(true); setActivePanel('chat'); setShowCommandPalette(false); } },
                  { icon: RotateCw, label: 'Reload page', action: () => setShowCommandPalette(false) },
                ].map(({ icon: Icon, label, action }, i) => (
                  <button
                    key={i}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left suggestion-item"
                    style={{ color: T.text, fontSize: 13, animationDelay: `${i * 0.03}s` }}
                    onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon className="w-4 h-4 shrink-0" style={{ color: T.textMuted }} />
                    {label}
                  </button>
                ))}

                {/* Bookmarks in palette */}
                {bookmarks.length > 0 && (
                  <>
                    <div style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '12px 20px 4px' }}>
                      Bookmarks
                    </div>
                    {bookmarks.map((b, i) => (
                      <button
                        key={i}
                        onClick={() => { setInputUrl(b.url); setShowCommandPalette(false); setTimeout(() => handleNavigate(), 10); }}
                        className="w-full flex items-center gap-3 px-5 py-3 transition-colors text-left"
                        style={{ color: T.text, fontSize: 13 }}
                        onMouseEnter={e => (e.currentTarget.style.background = T.surfaceHover)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Bookmark className="w-4 h-4 shrink-0" style={{ color: T.accent }} />
                        <span className="flex-1 truncate">{b.title}</span>
                        <span style={{ color: T.textMuted, fontSize: 11 }} className="truncate max-w-[180px]">{b.url}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Footer */}
              <div
                className="flex items-center gap-4 px-5 py-3"
                style={{ borderTop: `1px solid ${T.border}`, background: T.surfaceHover }}
              >
                {[['↑↓', 'Navigate'], ['↵', 'Open'], ['⎋', 'Close']].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: '1px 6px', fontSize: 11, color: T.text, fontFamily: '"DM Mono", monospace' }}>{key}</kbd>
                    <span style={{ color: T.textMuted, fontSize: 11 }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;