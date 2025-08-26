import { api, APIError } from "encore.dev/api";
import { coreDB } from "../core/db";
import { getAuthData } from "~encore/auth";
import { checkPermission } from "../users/permissions";

export interface DatabaseStats {
  active_connections: number;
  slow_queries: SlowQuery[];
  cache_hit_rate: number;
  index_hit_rate: number;
}

export interface SlowQuery {
  query: string;
  calls: number;
  total_time_ms: number;
  mean_time_ms: number;
  rows: number;
}

// Retrieves database performance statistics. (Admin only)
export const getDatabaseStats = api<void, DatabaseStats>(
  { expose: true, method: "GET", path: "/monitoring/db-stats", auth: true },
  async () => {
    const auth = getAuthData()!;
    await checkPermission(auth.userID, 'view_system_data');

    try {
      // Check for pg_stat_statements extension
      const extension = await coreDB.queryRow`
        SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'
      `;
      if (!extension) {
        throw APIError.failedPrecondition(
          "pg_stat_statements extension is not enabled. Please enable it in your PostgreSQL configuration."
        );
      }

      const activeConnections = await coreDB.queryRow<{ count: number }>`
        SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
      `;

      const slowQueries = await coreDB.queryAll<SlowQuery>`
        SELECT 
          query,
          calls,
          total_exec_time as total_time_ms,
          mean_exec_time as mean_time_ms,
          rows
        FROM pg_stat_statements
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `;

      const dbStats = await coreDB.queryRow<{
        blks_hit: number;
        blks_read: number;
        idx_blks_hit: number;
        idx_blks_read: number;
      }>`
        SELECT 
          sum(heap_blks_hit) as blks_hit, 
          sum(heap_blks_read) as blks_read,
          sum(idx_blks_hit) as idx_blks_hit,
          sum(idx_blks_read) as idx_blks_read
        FROM pg_statio_user_tables
      `;

      const cacheHitRate = dbStats && (dbStats.blks_hit + dbStats.blks_read > 0)
        ? (dbStats.blks_hit / (dbStats.blks_hit + dbStats.blks_read)) * 100
        : 0;

      const indexHitRate = dbStats && (dbStats.idx_blks_hit + dbStats.idx_blks_read > 0)
        ? (dbStats.idx_blks_hit / (dbStats.idx_blks_hit + dbStats.idx_blks_read)) * 100
        : 0;

      return {
        active_connections: activeConnections?.count || 0,
        slow_queries: slowQueries,
        cache_hit_rate: parseFloat(cacheHitRate.toFixed(2)),
        index_hit_rate: parseFloat(indexHitRate.toFixed(2))
      };
    } catch (error: any) {
      if (error instanceof APIError) throw error;
      console.error("Failed to get database stats:", error);
      throw APIError.internal("failed to retrieve database statistics", { originalError: error.message });
    }
  }
);
