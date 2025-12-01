// Client-side cache helper
const CACHE_PREFIX = 'presensi_cache_';
const CACHE_DURATION = 60 * 1000; // 1 minute

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export function setCache<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  
  const cacheData: CacheData<T> = {
    data,
    timestamp: Date.now(),
  };
  
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Failed to set cache:', error);
  }
}

export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const cacheData: CacheData<T> = JSON.parse(cached);
    const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return cacheData.data;
  } catch (error) {
    console.warn('Failed to get cache:', error);
    return null;
  }
}

export function clearCache(key?: string): void {
  if (typeof window === 'undefined') return;
  
  if (key) {
    localStorage.removeItem(CACHE_PREFIX + key);
  } else {
    // Clear all cache with prefix
    Object.keys(localStorage).forEach(storageKey => {
      if (storageKey.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(storageKey);
      }
    });
  }
}
