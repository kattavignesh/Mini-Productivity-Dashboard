import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Clock, CheckCircle, Loader, AlertCircle, Users,
  LogOut, Shield, User, ChevronDown, Search, Filter,
  TrendingUp, Calendar, Sparkles, LayoutDashboard,
  Settings, UserCheck, Lock,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  MOCK_USERS,
  getActivityLogs,
  getStats,
  getHoursPerEmployee,
  getHoursPerDay,
} from '../data/mockData';
import Spinner from '../components/Spinner';

/* ─── colour palette for chart ─────────────────────────────────── */
const CHART_COLORS = ['#3525cd', '#4f46e5', '#712ae2', '#a855f7', '#6366f1'];

const STATUS_META = {
  completed: { icon: CheckCircle, cls: 'status-completed', label: 'Completed' },
  'in-progress': { icon: Loader, cls: 'status-inprogress', label: 'In Progress' },
  pending: { icon: AlertCircle, cls: 'status-pending', label: 'Pending' },
};

export default function DashboardPage() {
  const { user, profile, loading, signOut, role } = useAuth();
  const navigate = useNavigate();

  // Navigation State
  const [currentTab, setCurrentTab] = useState('overview');

  const activeProfile = useMemo(() => {
    if (!user) return null;
    return MOCK_USERS.find((u) => u.email === user.email) ?? profile;
  }, [user, profile]);

  const currentUserId = activeProfile?.id ?? null;
  const isManager = (role ?? activeProfile?.role) === 'manager';

  const allLogs = useMemo(
    () => getActivityLogs(currentUserId, role ?? activeProfile?.role),
    [currentUserId, role, activeProfile]
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      const matchSearch =
        log.task.toLowerCase().includes(search.toLowerCase()) ||
        log.profile?.full_name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allLogs, search, statusFilter]);

  const stats = useMemo(() => getStats(filteredLogs), [filteredLogs]);
  const hoursPerEmp = useMemo(() => getHoursPerEmployee(allLogs), [allLogs]);
  const hoursPerDay = useMemo(() => getHoursPerDay(allLogs), [allLogs]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) return <div className="page-center"><Spinner size={48} /></div>;

  return (
    <div className="dashboard-layout">
      {/* ════ SIDENAV BAR (Left) ═══════════════════════════════════ */}
      <aside className="side-nav">
        <div className="sidebar-logo">
          <div className="logo-icon small"><TrendingUp size={18} color="#fff" /></div>
          <span className="logo-text">Zoiko.</span>
        </div>

        <nav className="sidebar-nav">
          <div
            className={`nav-item ${currentTab === 'overview' ? 'active' : ''}`}
            onClick={() => setCurrentTab('overview')}
          >
            <LayoutDashboard size={20} />
            <span>{isManager ? 'Team View' : 'My Progress'}</span>
          </div>
          <div
            className={`nav-item ${currentTab === 'logs' ? 'active' : ''}`}
            onClick={() => setCurrentTab('logs')}
          >
            <Calendar size={20} />
            <span>Activity Logs</span>
          </div>
          {isManager && (
            <div
              className={`nav-item ${currentTab === 'department' ? 'active' : ''}`}
              onClick={() => setCurrentTab('department')}
            >
              <Users size={20} />
              <span>Department</span>
            </div>
          )}
          <div
            className={`nav-item ${currentTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setCurrentTab('privacy')}
          >
            <Shield size={20} />
            <span>Privacy</span>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <button className="signout-btn" onClick={handleSignOut}><LogOut size={16} />Log out</button>
        </div>
      </aside>

      {/* ════ MAIN STAGE ═══════════════════════════════════════════ */}
      <div className="main-stage">
        {/* ─── TOPNAV BAR ────────────────────────────────────────── */}
        <header className="top-nav">
          <div className="top-nav-left">
            <div className="search-pill">
              <Search size={16} className="search-icon-dim" />
              <input
                type="text"
                placeholder="Search metrics, logs, or team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="top-nav-right">
            <div className="button-group-nav">
              <div className="icon-btn dimmed"><Sparkles size={18} /></div>
            </div>
            <div className="divider-v"></div>
            <div className="user-profile-widget">
              <div className="profile-text">
                <span className="profile-n">{activeProfile?.full_name ?? user?.email}</span>
                <span className="profile-r">{isManager ? 'Global Manager' : 'Product Associate'}</span>
              </div>
              <div className="avatar">{(activeProfile?.full_name ?? 'U')[0]}</div>
            </div>
          </div>
        </header>

        {/* ─── DYNAMIC TABS ───────────────────────────────────────── */}
        <main className="main-scroll">
          <div className="content-container">

            {/* TAB: OVERVIEW */}
            {currentTab === 'overview' && (
              <>
                <div className="context-header">
                  <div>
                    <h1 className="display-headline">
                      {isManager ? 'Manager Overview' : 'Personal Dashboard'}
                    </h1>
                    <p className="body-muted">
                      {isManager ? 'Performance reporting for the Global Product Team' : 'Your performance metrics and weekly highlights'}
                    </p>
                  </div>
                </div>

                <div className={`ai-editorial-banner ${isManager ? 'manager' : 'employee'}`}>
                  <div className="banner-accent"></div>
                  <div className="banner-content">
                    <div className="banner-label">
                      <Sparkles size={18} color="var(--primary)" />
                      <span className="label-sm">Generative Intelligence · Weekly Summary</span>
                    </div>
                    <p className="banner-text">
                      {isManager
                        ? "Engineering throughput remains stable. Alice Johnson (Stitch UI) and Bob Martinez (Database) have both met their weekly milestones. Alert: 2 upcoming cycles in 'Design' require manager re-allocation for optimal sprint performance."
                        : "You’ve exceeded your weekly output target with a focus on 'Deep Work' cycles. Your contributions in 'UI Implementation' represent 65% of your total logged time. Velocity Insight: Tuesday showed peak efficiency due to a meeting-free block."
                      }
                    </p>
                  </div>
                </div>

                <section className="dashboard-stats-grid">
                  <StatCard icon={<Clock size={24} />} label={isManager ? "Total Team Hours" : "My Logged Hours"} value={isManager ? stats.totalHours : "22.5"} accent="primary" />
                  <StatCard icon={<CheckCircle size={24} />} label="Tasks Finalized" value={stats.completed} accent="emerald" />
                  {isManager && <StatCard icon={<Users size={24} />} label="Contributors" value={stats.uniqueEmployees} accent="violet" />}
                  <StatCard icon={<Loader size={24} />} label="Active Cycles" value={stats.inProgress} accent="amber" />
                </section>

                <div className="dashboard-charts">
                  <div className="chart-item">
                    <h3 className="title-sm">Performance Velocity</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={hoursPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3525cd" stopOpacity={0.12} />
                            <stop offset="95%" stopColor="#3525cd" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-ambient)' }} />
                        <Area type="monotone" dataKey="hours" stroke="#3525cd" strokeWidth={3} fill="url(#primaryGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-item">
                    <h3 className="title-sm">{isManager ? 'Resources Allocation' : 'Weekly Distribution'}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={isManager ? hoursPerEmp : hoursPerDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.03)" />
                        <XAxis dataKey={isManager ? "name" : "date"} axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#777587', fontSize: 11 }} />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-ambient)' }} />
                        <Bar dataKey="hours" radius={[6, 6, 0, 0]} barSize={24}>
                          {CHART_COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* TAB: LOGS */}
            {(currentTab === 'logs' || currentTab === 'overview') && (
              <div className="activity-section" style={{ marginTop: currentTab === 'logs' ? 0 : '2rem' }}>
                <div className="section-head">
                  <h3 className="headline-md">
                    {currentTab === 'logs' ? 'Full Activity Audit Log' : 'Recent activity'}
                  </h3>
                  <div className="head-filters">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="minimal-select">
                      <option value="all">Every State</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="data-table-container">
                  <table className="editorial-table">
                    <thead>
                      <tr>
                        <th>Timeframe</th>
                        {isManager && <th>Resource</th>}
                        <th>Objective</th>
                        <th>Output</th>
                        <th>Metric</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => {
                        const meta = STATUS_META[log.status] ?? STATUS_META['pending'];
                        return (
                          <tr key={log.id} className="editorial-row">
                            <td className="cell-date">{log.date}</td>
                            {isManager && <td className="cell-user">{log.profile?.full_name}</td>}
                            <td className="cell-task">{log.task}</td>
                            <td className="cell-hours">{log.hours}h</td>
                            <td>
                              <span className={`badge-pill ${meta.cls}`}>
                                <meta.icon size={12} />
                                {meta.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DEPARTMENT */}
            {currentTab === 'department' && (
              <div className="department-view">
                <h1 className="display-headline">Team Directory</h1>
                <p className="body-muted">Management of the current resources and talent allocation.</p>

                <div className="team-grid-editorial" style={{ marginTop: '2rem' }}>
                  {MOCK_USERS.map(u => (
                    <div key={u.id} className="team-card">
                      <div className="avatar large">{u.full_name[0]}</div>
                      <div className="team-card-info">
                        <h4 className="body-lg" style={{ fontWeight: 700 }}>{u.full_name}</h4>
                        <p className="label-sm" style={{ color: 'var(--text-muted)' }}>{u.role} · {u.department}</p>
                        <div className="status-indicator">
                          <span className="dot online"></span>
                          <span className="label-xs">Active Now</span>
                        </div>
                      </div>
                      <button className="btn-secondary-sm"></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {currentTab === 'privacy' && (
              <div className="privacy-view">
                <h1 className="display-headline">Data & Security</h1>
                <p className="body-muted">Manage how your activity logs are shared and secured.</p>

                <div className="settings-stack" style={{ marginTop: '2rem' }}>
                  <SettingRow
                    icon={<Lock size={20} />}
                    title="Two-Factor Authentication"
                    desc="Add an extra layer of security to your Zoiko account."
                    active={true}
                  />

                  <div className="setting-row password-change-section" style={{ display: 'block' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
                      <div className="setting-icon-box"><Shield size={20} /></div>
                      <div className="setting-text">
                        <h4 className="body-md" style={{ fontWeight: 600 }}>Update Password</h4>
                        <p className="label-sm" style={{ color: 'var(--text-muted)' }}>Manage your secure access credentials.</p>
                      </div>
                    </div>

                    <div className="password-mock-form" style={{ maxWidth: '400px' }}>
                      <div className="input-group" style={{ marginBottom: '1rem' }}>
                        <span className="label-xs">Current Password</span>
                        <input type="password" placeholder="••••••••" style={{ background: 'var(--bg-surface)', padding: '0.6rem', border: '1px solid var(--border-light)', borderRadius: '8px', width: '100%', fontSize: '0.8rem' }} />
                      </div>
                      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                        <span className="label-xs">New Password</span>
                        <input type="password" placeholder="••••••••" style={{ background: 'var(--bg-surface)', padding: '0.6rem', border: '1px solid var(--border-light)', borderRadius: '8px', width: '100%', fontSize: '0.8rem' }} />
                      </div>
                      <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }} onClick={() => alert('Demo: Password change simulated.')}>Sync New Credentials</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="dash-stat-card">
      <div className={`stat-icon-wrap stat-icon-${accent}`}>{icon}</div>
      <div className="stat-body">
        <span className="stat-v">{value}</span>
        <span className="stat-l">{label}</span>
      </div>
    </div>
  );
}

function SettingRow({ icon, title, desc, active }) {
  return (
    <div className="setting-row">
      <div className="setting-icon-box">{icon}</div>
      <div className="setting-text">
        <h4 className="body-md" style={{ fontWeight: 600 }}>{title}</h4>
        <p className="label-sm" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <div className="setting-action">
        <button className={`toggle-pill ${active ? 'active' : ''}`}></button>
      </div>
    </div>
  );
}
