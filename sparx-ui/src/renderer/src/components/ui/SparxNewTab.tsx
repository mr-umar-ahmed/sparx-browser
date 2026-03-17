// src/components/ui/SparxNewTab.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion';
import {
  Search, Sparkles, ArrowRight, Plus, 
  Github, LayoutTemplate, MonitorPlay, Flame, Newspaper, TrendingUp, Cpu, Database
} from 'lucide-react';

// --- HELPER FUNCTION ---
const getTimeAgo = (unixTimestamp: number) => {
  const seconds = Math.floor(Date.now() / 1000) - unixTimestamp;
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
  return Math.floor(seconds / 86400) + 'd ago';
};

// --- SPOTLIGHT CARD ---
export const SpotlightCard = ({ children, T, delay = 0 }: { children: React.ReactNode, T: any, delay?: number }) => {
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

// --- MAIN NEW TAB COMPONENT ---
export default function SparxNewTab({ onNavigate, T, isPrivacyMode }: { onNavigate: (url: string) => void, T: any, isPrivacyMode: boolean }) {
  const [query, setQuery] = useState('');
  const [time, setTime] = useState(new Date());
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const initialFakeNews = [
    { id: 'f1', title: "React 19 RC: Compiler and Actions take center stage", by: "react_team", score: 1405, time: Math.floor(Date.now() / 1000) - 3600, url: "https://react.dev/blog" },
    { id: 'f2', title: "OpenAI releases new smaller, faster models for edge devices", by: "ai_insider", score: 950, time: Math.floor(Date.now() / 1000) - 7200, url: "https://openai.com/blog" },
    { id: 'f3', title: "The death of the localhost? Cloud environments surge in 2026", by: "dev_trends", score: 620, time: Math.floor(Date.now() / 1000) - 14400, url: "https://news.ycombinator.com" }
  ];

  const initialFakeRepos = [
    { id: 'r1', full_name: "SparxUI/sparx-engine", description: "A lightning-fast, privacy-first browser engine designed for AI integrations.", stargazers_count: 14500, language: "Rust", html_url: "https://github.com" },
    { id: 'r2', full_name: "facebook/react-strict", description: "Experimental strict-mode enforced React compiler for absolute performance.", stargazers_count: 8200, language: "TypeScript", html_url: "https://github.com/facebook/react" },
  ];

  const [techNews, setTechNews] = useState<any[]>(initialFakeNews);
  const [githubTrending, setGithubTrending] = useState<any[]>(initialFakeRepos);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const hnIds = await hnRes.json();
        const topIds = hnIds.slice(0, 3);
        const stories = await Promise.all(
          topIds.map((id: number) => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
        );
        setTechNews([...stories.filter(Boolean), ...initialFakeNews].slice(0, 5));

        const date = new Date();
        date.setDate(date.getDate() - 7);
        const formattedDate = date.toISOString().split('T')[0];
        
        const ghRes = await fetch(`https://api.github.com/search/repositories?q=created:>${formattedDate}&sort=stars&order=desc`);
        const ghData = await ghRes.json();
        const realRepos = ghData.items ? ghData.items.slice(0, 2) : [];
        setGithubTrending([...realRepos, ...initialFakeRepos].slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch live data, using fallbacks.", error);
      }
    };
    fetchLiveData();
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

  return (
    <div className="w-full h-full flex flex-col items-center pt-24 pb-12 px-8 relative overflow-y-auto no-scrollbar" style={{ background: T.bg }}>
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
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 200 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: isPrivacyMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: T.text, fontFamily: '"Clash Display", "DM Sans", sans-serif' }}>Sparx</h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ color: T.textMuted, fontSize: 16, fontWeight: 500 }}
          >
            {greeting}. Ready to build?
          </motion.p>
        </div>
        
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <SpotlightCard T={T} delay={0.4}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-50 text-orange-500"><Newspaper className="w-4 h-4" /></div>
                <h2 className="font-semibold text-sm tracking-wide uppercase" style={{ color: T.textMuted }}>Tech & AI Feed</h2>
              </div>
              <a href="https://news.ycombinator.com" onClick={(e) => { e.preventDefault(); onNavigate('https://news.ycombinator.com'); }} className="text-xs hover:underline" style={{ color: T.accent }}>View all</a>
            </div>
            
            <div className="flex flex-col gap-5">
              {techNews.map((news, i) => (
                <div key={news.id || i} className="group cursor-pointer" onClick={() => news.url && onNavigate(news.url)}>
                  <h3 className="font-medium text-[15px] leading-snug group-hover:text-blue-600 transition-colors mb-1.5 line-clamp-2" style={{ color: T.text }}>{news.title}</h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: T.textDim }}>
                    <span className="font-medium text-gray-500">{news.score} pts by {news.by}</span>
                    <span>•</span>
                    <span>{getTimeAgo(news.time)}</span>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard T={T} delay={0.5}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600"><TrendingUp className="w-4 h-4" /></div>
                <h2 className="font-semibold text-sm tracking-wide uppercase" style={{ color: T.textMuted }}>Trending Repos</h2>
              </div>
              <a href="https://github.com/trending" onClick={(e) => { e.preventDefault(); onNavigate('https://github.com/trending'); }} className="text-xs hover:underline" style={{ color: T.accent }}>View all</a>
            </div>

            <div className="flex flex-col gap-4">
              {githubTrending.map((repo, i) => (
                <div key={repo.id || i} onClick={() => onNavigate(repo.html_url)} className="group cursor-pointer p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[15px] group-hover:text-blue-600 transition-colors truncate pr-2" style={{ color: T.accent }}>{repo.full_name}</h3>
                    <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-white rounded-md border shadow-sm shrink-0" style={{ color: T.textMuted, borderColor: T.border }}>
                      <Flame className="w-3.5 h-3.5 text-orange-500" /> 
                      {Intl.NumberFormat('en-US', { notation: "compact" }).format(repo.stargazers_count)}
                    </div>
                  </div>
                  <p className="text-[13px] line-clamp-2 mb-3 leading-relaxed" style={{ color: T.textMuted }}>{repo.description || "No description provided."}</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: T.textDim }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: repo.language === 'Rust' ? '#dea584' : repo.language === 'TypeScript' ? '#3178c6' : '#cbd5e1' }} />
                    {repo.language || 'Markdown'}
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}