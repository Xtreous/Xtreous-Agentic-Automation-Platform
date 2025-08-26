import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Activity, 
  Gauge, 
  Clock, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useBackend } from '../hooks/useBackend';

export default function MonitoringPage() {
  const backend = useBackend();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['db-stats'],
    queryFn: () => backend.monitoring.getDatabaseStats()
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {(error as any).message || 'Failed to load database statistics.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Database Monitoring</h1>
          <p className="text-gray-400 mt-2">
            Real-time performance metrics for the application database
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Active Connections
              </CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_connections}</div>
              <p className="text-xs text-gray-400 mt-1">
                Currently active database connections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Cache Hit Rate
              </CardTitle>
              <Gauge className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.cache_hit_rate}%</div>
              <Progress value={stats?.cache_hit_rate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Index Hit Rate
              </CardTitle>
              <Gauge className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.index_hit_rate}%</div>
              <Progress value={stats?.index_hit_rate} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Slow Queries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Top 10 Slowest Queries
            </CardTitle>
            <CardDescription>
              Queries with the highest mean execution time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Query</TableHead>
                  <TableHead className="text-right">Calls</TableHead>
                  <TableHead className="text-right">Mean Time (ms)</TableHead>
                  <TableHead className="text-right">Total Time (ms)</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.slow_queries.map((query, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs max-w-md truncate">{query.query}</TableCell>
                    <TableCell className="text-right">{query.calls}</TableCell>
                    <TableCell className="text-right">{query.mean_time_ms.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{query.total_time_ms.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{query.rows}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {stats?.slow_queries.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No slow queries recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
