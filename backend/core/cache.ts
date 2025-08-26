import { Redis } from "ioredis";

// Redis client for caching
let redis: Redis | null = null;

// Initialize Redis connection
export function initRedis() {
  if (!redis) {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });
  }
  return redis;
}

// Get Redis client
export function getRedis(): Redis {
  if (!redis) {
    redis = initRedis();
  }
  return redis;
}

// Cache keys
export const CACHE_KEYS = {
  AGENT: (id: number) => `agent:${id}`,
  AGENT_LIST: (filters: string) => `agents:list:${filters}`,
  AGENT_SKILLS: (agentId: number) => `agent:${agentId}:skills`,
  AGENT_PERFORMANCE: (agentId: number, days: number) => `agent:${agentId}:performance:${days}`,
  AGENT_WORKLOAD: (agentId: number) => `agent:${agentId}:workload`,
  SKILL_RECOMMENDATIONS: (agentId: number, status?: string) => `agent:${agentId}:recommendations:${status || 'all'}`,
  TRAINING_SESSIONS: (agentId: number, status?: string) => `agent:${agentId}:training:${status || 'all'}`,
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  AGENT: 300, // 5 minutes
  AGENT_LIST: 60, // 1 minute
  AGENT_SKILLS: 300, // 5 minutes
  AGENT_PERFORMANCE: 600, // 10 minutes
  AGENT_WORKLOAD: 30, // 30 seconds
  SKILL_RECOMMENDATIONS: 300, // 5 minutes
  TRAINING_SESSIONS: 300, // 5 minutes
} as const;

// Cache helper functions
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttl: number): Promise<void> {
  try {
    const redis = getRedis();
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function deleteCachedPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

// Cache invalidation helpers
export async function invalidateAgentCache(agentId: number): Promise<void> {
  await Promise.all([
    deleteCached(CACHE_KEYS.AGENT(agentId)),
    deleteCached(CACHE_KEYS.AGENT_SKILLS(agentId)),
    deleteCached(CACHE_KEYS.AGENT_WORKLOAD(agentId)),
    deleteCachedPattern(CACHE_KEYS.AGENT_PERFORMANCE(agentId, 0).replace(':0', ':*')),
    deleteCachedPattern(CACHE_KEYS.SKILL_RECOMMENDATIONS(agentId, '').replace('::', ':*')),
    deleteCachedPattern(CACHE_KEYS.TRAINING_SESSIONS(agentId, '').replace('::', ':*')),
    deleteCachedPattern('agents:list:*'),
  ]);
}

export async function invalidateAgentListCache(): Promise<void> {
  await deleteCachedPattern('agents:list:*');
}
