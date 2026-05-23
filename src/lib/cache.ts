import "server-only";

/**
 * Lightweight in-process TTL cache with tag invalidation.
 * Single-instance (good for Vercel serverless warm starts).
 * Production with multiple instances should swap the backing store for
 * Redis or Vercel Runtime Cache — interface remains the same.
 */

type Entry<T> = { value: T; expiresAt: number; tags: Set<string> };

class TaggedCache {
  private store = new Map<string, Entry<unknown>>();
  private inflight = new Map<string, Promise<unknown>>();

  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    opts: { ttlMs?: number; tags?: string[] } = {},
  ): Promise<T> {
    const ttl = opts.ttlMs ?? 60_000;
    const now = Date.now();
    const hit = this.store.get(key);
    if (hit && hit.expiresAt > now) return hit.value as T;
    const flying = this.inflight.get(key);
    if (flying) return flying as Promise<T>;

    const promise = fetcher().then(
      (value) => {
        this.store.set(key, {
          value,
          expiresAt: now + ttl,
          tags: new Set(opts.tags ?? []),
        });
        this.inflight.delete(key);
        return value;
      },
      (err) => {
        this.inflight.delete(key);
        throw err;
      },
    );
    this.inflight.set(key, promise);
    return promise;
  }

  invalidate(tag: string): number {
    let removed = 0;
    for (const [k, v] of this.store) {
      if (v.tags.has(tag)) {
        this.store.delete(k);
        removed++;
      }
    }
    return removed;
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const intelligenceCache = new TaggedCache();

export const CACHE_TAGS = {
  snapshot: "intelligence:snapshot",
  monday: "monday:items",
  status: "monday:status",
} as const;
