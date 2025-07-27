// lib/kv.ts
type Value = string | number | boolean | null | undefined;
type Store = Record<string, Value>;
type Cache = Record<string, Value | symbol>;

const TOMBSTONE = Symbol('TOMBSTONE');
let persistent_store: Store = {};
let cache: Cache = {};
let cache_count = 0;
const max_cache_size = 1000;

export const kv = {
  /**
   * Retrieve a value from the key-value store
   * @param key The key to retrieve
   * @returns The value or null if not found
   */
  get: async (key: string): Promise<Value> => {
    if (cache[key] === TOMBSTONE) return null;
    if (cache[key] !== undefined) return cache[key] as Value;
    return persistent_store[key];
  },

  /**
   * Set a value in the key-value store
   * @param key The key to set
   * @param value The value to store
   */
  set: async (key: string, value: Value): Promise<void> => {
    const was_cached = cache[key] !== undefined;
    cache[key] = value;

    if (!was_cached) {
      cache_count++;
      if (cache_count >= max_cache_size) await kv.flush();
    }
  },

  /**
   * Delete a key from the store
   * @param key The key to delete
   */
  delete: async (key: string): Promise<void> => {
    const was_cached = cache[key] !== undefined;
    cache[key] = TOMBSTONE;

    if (!was_cached) {
      cache_count++;
      if (cache_count >= max_cache_size) await kv.flush();
    }
  },

  /**
   * Flush all pending writes to persistent storage
   */
  flush: async (): Promise<void> => {
    Object.entries(cache).forEach(([key, value]) => {
      if (value === TOMBSTONE) {
        delete persistent_store[key];
      } else {
        persistent_store[key] = value as Value;
      }
    });

    // Reset cache
    cache = {};
    cache_count = 0;
  },

  /**
   * Reset the entire store (for testing purposes)
   */
  _reset: async (): Promise<void> => {
    persistent_store = {};
    cache = {};
    cache_count = 0;
  }
};
