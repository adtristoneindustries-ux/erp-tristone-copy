import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { dashboardAPI } from '../services/api';
import { Server, Cpu, HardDrive, Users, RefreshCw, Wifi, Database, Clock } from 'lucide-react';

const MetricBar = ({ label, value, max, color }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const barColor = pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-yellow-500' : `bg-${color}-500`;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{value} / {max} MB</div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
      <Icon size={22} className={`text-${color}-600`} />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400">{sub}</div>}
    </div>
  </div>
);

const AdminSystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await dashboardAPI.getSystemHealth();
      setHealth(res.data);
      setLastUpdated(new Date());
    } catch (e) {
      console.error('Health fetch failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const formatUptime = (h, m) => `${h}h ${m}m`;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        <Navbar />
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Server className="text-blue-600" size={24} />
              <h1 className="text-xl lg:text-2xl font-bold">System Health</h1>
              <span className={`w-2.5 h-2.5 rounded-full ${health ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded" />
                Auto-refresh (15s)
              </label>
              <button onClick={fetchHealth}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>

          {lastUpdated && (
            <p className="text-xs text-gray-400 mb-4">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}

          {loading && !health ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw size={32} className="animate-spin text-blue-500" />
            </div>
          ) : health ? (
            <>
              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Database} label="Database" value={health.db.status === 'connected' ? 'Online' : 'Offline'}
                  sub="MongoDB" color={health.db.status === 'connected' ? 'green' : 'red'} />
                <StatCard icon={Users} label="Online Users" value={health.users.online}
                  sub={`of ${health.users.total} total`} color="blue" />
                <StatCard icon={Clock} label="Server Uptime" value={formatUptime(health.uptime.hours, health.uptime.minutes)}
                  sub={health.platform} color="purple" />
                <StatCard icon={Cpu} label="CPU Cores" value={health.cpu.cores}
                  sub={`Load avg: ${health.cpu.load}`} color="orange" />
              </div>

              {/* Memory & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <HardDrive size={18} className="text-blue-600" /> Memory Usage
                  </h2>
                  <MetricBar label="RAM Used" value={health.memory.used} max={health.memory.total} color="blue" />
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-700">{health.memory.used} MB</div>
                      <div className="text-xs text-gray-500">Used</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-700">{health.memory.free} MB</div>
                      <div className="text-xs text-gray-500">Free</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-gray-700">{health.memory.total} MB</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Wifi size={18} className="text-green-600" /> System Info
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Node.js Version', value: health.nodeVersion },
                      { label: 'Platform', value: health.platform },
                      { label: 'CPU Load (1m avg)', value: health.cpu.load },
                      { label: 'CPU Cores', value: health.cpu.cores },
                      { label: 'Total Memory', value: `${health.memory.total} MB` },
                      { label: 'DB Status', value: health.db.status, badge: true }
                    ].map(({ label, value, badge }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500">{label}</span>
                        {badge ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            value === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>{value}</span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-800">{value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Users size={18} className="text-purple-600" /> User Activity
                </h2>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Active Sessions</span>
                      <span className="font-semibold">{health.users.total > 0 ? Math.round((health.users.online / health.users.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${health.users.total > 0 ? (health.users.online / health.users.total) * 100 : 0}%` }} />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{health.users.online} online of {health.users.total} registered users</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-400">
              <Server size={48} className="mx-auto mb-3 opacity-30" />
              <p>Unable to fetch system health data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemHealth;
