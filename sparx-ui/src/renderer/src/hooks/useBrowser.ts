import { useState, useEffect, useCallback } from 'react';

export interface Tab { id: string; title: string; url: string; favicon?: string; pinned?: boolean; isLoading?: boolean; }
export interface BookmarkItem { title: string; url: string; }
export interface NoteItem { id: string; title: string; content: string; timestamp: number; }

export const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Corrupted data found in localStorage for ${key}. Reverting to default.`);
    return fallback;
  }
};

const getFavicon = (url: string) => {
  if (url === 'sparx://newtab') return null;
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return null; }
};

export function useBrowser() {
  // --- UPDATED: Default to Custom New Tab ---
  const [tabs, setTabs] = useState<Tab[]>(() => safeParse('sparx_tabs', [{ id: '1', title: 'New Tab', url: 'sparx://newtab', isLoading: false }]));
  const [activeTabId, setActiveTabId] = useState<string>(() => localStorage.getItem('sparx_activeTab') || '1');
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => safeParse('sparx_bookmarks', []));
  const [history, setHistory] = useState<BookmarkItem[]>(() => safeParse('sparx_history', []));
  const [notes, setNotes] = useState<NoteItem[]>(() => safeParse('sparx_notes', []));
  
  const [isPrivacyMode, setIsPrivacyMode] = useState(() => safeParse('sparx_privacy', false));

  useEffect(() => { localStorage.setItem('sparx_tabs', JSON.stringify(tabs)); }, [tabs]);
  useEffect(() => { localStorage.setItem('sparx_activeTab', activeTabId); }, [activeTabId]);
  useEffect(() => { localStorage.setItem('sparx_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('sparx_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('sparx_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('sparx_privacy', JSON.stringify(isPrivacyMode)); }, [isPrivacyMode]);

  // Sync URL bar with active tab, hide internal URL
  useEffect(() => {
    const active = tabs.find(t => t.id === activeTabId);
    if (active && !isUrlFocused) {
      setInputUrl(active.url === 'sparx://newtab' ? '' : active.url);
    }
  }, [activeTabId, tabs, isUrlFocused]);

  const handleAddTab = useCallback(() => {
    const id = Date.now().toString();
    setTabs(p => [...p, { id, title: 'New Tab', url: 'sparx://newtab' }]);
    setActiveTabId(id); 
    setInputUrl('');
  }, []);

  const handleCloseTab = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTabId === id) { 
      const nextActive = next[next.length - 1];
      setActiveTabId(nextActive.id); 
      setInputUrl(nextActive.url === 'sparx://newtab' ? '' : nextActive.url); 
    }
  }, [tabs, activeTabId]);

  const handleSwitchTab = useCallback((tab: Tab) => { 
    setActiveTabId(tab.id); 
    setInputUrl(tab.url === 'sparx://newtab' ? '' : tab.url); 
  }, []);

  const handlePinTab = useCallback((e: React.MouseEvent, id: string) => { e.stopPropagation(); setTabs(p => p.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t)); }, []);

  const handleNavigate = useCallback((newUrl?: string) => {
    let url = (newUrl || inputUrl).trim();
    if (!url) return;
    
    // Ignore internal protocol for search parsing
    if (url !== 'sparx://newtab') {
      if (!url.includes('.') || url.includes(' ')) { url = `https://www.google.com/search?q=${encodeURIComponent(url)}`; } 
      else if (!url.startsWith('http')) { url = 'https://' + url; }
    }
    
    const title = url === 'sparx://newtab' ? 'New Tab' : (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url.slice(0, 24); } })();
    
    if (!isPrivacyMode && url !== 'sparx://newtab') {
      setHistory(p => [{ title, url }, ...p].slice(0, 50)); 
    }
    
    setTabs(p => p.map(t => t.id === activeTabId ? { ...t, url, title, favicon: getFavicon(url) ?? undefined } : t));
    setInputUrl(url === 'sparx://newtab' ? '' : url); 
  }, [inputUrl, activeTabId, isPrivacyMode]);

  const addBookmark = useCallback(() => {
    const active = tabs.find(t => t.id === activeTabId);
    if (!active || active.url === 'sparx://newtab') return; // Don't bookmark new tabs
    setBookmarks(p => { if (p.some(b => b.url === active.url)) return p; return [...p, { title: active.title, url: active.url }]; });
  }, [tabs, activeTabId]);

  return {
    tabs, setTabs, activeTabId, setActiveTabId, inputUrl, setInputUrl, isUrlFocused, setIsUrlFocused, canGoBack, setCanGoBack, canGoForward, setCanGoForward,
    bookmarks, setBookmarks, history, setHistory, notes, setNotes, 
    isPrivacyMode, setIsPrivacyMode, 
    handleAddTab, handleCloseTab, handleSwitchTab, handlePinTab, handleNavigate, addBookmark,
    activeTab: tabs.find(t => t.id === activeTabId)
  };
}