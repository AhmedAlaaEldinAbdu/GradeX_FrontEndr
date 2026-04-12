import { useState, useEffect } from 'react';

const DB_NAME = 'GradeX-DraftDB';
const STORE_NAME = 'form_drafts';
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database.
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * A generic hook to manage storing and retrieving form states (including Files) via IndexedDB.
 * @param storageKey The unique key used in IndexedDB.
 * @returns An object containing the draft data, methods to save/clear the draft,
 *          and a boolean indicating if the draft was successfully loaded.
 */
export function useFormDraft<T>(storageKey: string) {
  const [draftData, setDraftData] = useState<T | null>(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const db = await initDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(storageKey);

        request.onsuccess = () => {
          if (!mounted) return;
          if (request.result) {
            setDraftData(request.result);
            setIsDraftLoaded(true);
          } else {
            // No draft found, but we finished checking
            setIsDraftLoaded(true);
          }
        };

        request.onerror = () => {
          if (!mounted) return;
          console.error('Failed to get draft from IndexedDB:', request.error);
          setIsDraftLoaded(true); // Don't block UI indefinitely
        };
      } catch (e) {
        if (!mounted) return;
        console.error('Failed to init IndexedDB:', e);
        setIsDraftLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [storageKey]);

  const saveDraft = async (data: T) => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(data, storageKey);

      tx.oncomplete = () => {
        setDraftData(data);
      };

      tx.onerror = () => {
        console.error('Transaction failed while saving draft:', tx.error);
      };
    } catch (e) {
      console.error('Failed to save draft to IndexedDB:', e);
    }
  };

  const clearDraft = async () => {
    try {
      const db = await initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(storageKey);

      tx.oncomplete = () => {
        setDraftData(null);
      };

      tx.onerror = () => {
        console.error('Transaction failed while clearing draft:', tx.error);
      };
    } catch (e) {
      console.error('Failed to clear draft from IndexedDB:', e);
    }
  };

  return { draftData, isDraftLoaded, saveDraft, clearDraft };
}
