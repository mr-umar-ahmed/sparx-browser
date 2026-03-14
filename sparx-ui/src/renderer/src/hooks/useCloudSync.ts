import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { BookmarkItem, NoteItem } from './useBrowser';

export function useCloudSync(
  user: User | null, 
  bookmarks: BookmarkItem[], 
  history: BookmarkItem[], 
  notes: NoteItem[],
  setBookmarks: React.Dispatch<React.SetStateAction<BookmarkItem[]>>, 
  setHistory: React.Dispatch<React.SetStateAction<BookmarkItem[]>>,
  setNotes: React.Dispatch<React.SetStateAction<NoteItem[]>>,
  isPrivacyMode: boolean // <-- NEW: Catch privacy state
) {
  const [cloudStatus, setCloudStatus] = useState<'syncing' | 'synced' | 'error' | 'paused'>('synced');
  const [hasLoadedFromCloud, setHasLoadedFromCloud] = useState(false);

  /* ── CLOUD PULL ── */
  useEffect(() => {
    // If user is not logged in, or PRIVACY MODE is active, abort the pull!
    if (!user || isPrivacyMode) { 
      if (isPrivacyMode) setCloudStatus('paused');
      return; 
    }
    
    const loadCloudData = async () => {
      setCloudStatus('syncing');
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.bookmarks) setBookmarks(data.bookmarks);
          if (data.history) setHistory(data.history);
          if (data.notes) setNotes(data.notes); 
        }
        setCloudStatus('synced');
        setHasLoadedFromCloud(true);
      } catch (error) {
        setCloudStatus('error');
        setHasLoadedFromCloud(true);
      }
    };
    loadCloudData();
  }, [user, setBookmarks, setHistory, setNotes, isPrivacyMode]);

  /* ── CLOUD PUSH (KILL SWITCH) ── */
  useEffect(() => {
    // If PRIVACY MODE is active, completely block data from leaving the app
    if (!user || !hasLoadedFromCloud || isPrivacyMode) {
      if (isPrivacyMode) setCloudStatus('paused');
      return;
    }
    
    const pushToCloud = async () => {
      setCloudStatus('syncing');
      try {
        await setDoc(doc(db, "users", user.uid), { bookmarks, history, notes }, { merge: true });
        setCloudStatus('synced');
      } catch (error) {
        setCloudStatus('error');
      }
    };
    
    const timer = setTimeout(pushToCloud, 2000); 
    return () => clearTimeout(timer);
  }, [bookmarks, history, notes, user, hasLoadedFromCloud, isPrivacyMode]);

  return { cloudStatus };
}