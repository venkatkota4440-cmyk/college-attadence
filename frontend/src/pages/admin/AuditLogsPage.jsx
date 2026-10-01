import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../services/api';
import { TableSkeleton } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';
import { ShieldCheck } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetchApi('/admin/audit-logs');
        if (res.success) setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
        <p className="text-xs text-slate-500">Tamper-evident trail of attendance modifications, record corrections, and admin operations.</p>
      </div>

      {loading ? (
        <TableSkeleton rows={8} cols={5} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">New Value / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.user?.name}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={log.action.includes('UPDATED') ? 'amber' : 'emerald'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{log.entity}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-md truncate">
                    {log.newValue || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
