import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import Dashboard from './pages/Dashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import MapPage from './pages/MapPage';
import ComplaintsPage from './pages/ComplaintsPage';
import WorkersPage from './pages/WorkersPage';
import InchargePage from './pages/InchargePage';
import ReportPage from './pages/ReportPage';
import LoginPage from './pages/LoginPage';
import { workersData } from './data/appData';

const pageTitles = {
  '/': 'dashboard',
  '/map': 'dustbinMap',
  '/complaints': 'complaints',
  '/workers': 'workers',
  '/incharge': 'areaIncharge',
  '/report': 'reportIssue',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('citizen');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userProfileId, setUserProfileId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Generate admin notifications for workers who haven't uploaded
  const missingWorkers = workersData.filter(w => !w.photoUploaded && w.status === 'active');
  const adminNotifications = [
    ...missingWorkers.map(w => ({
      id: `notif-${w.id}`,
      title: `⚠️ Missing Photo: ${w.name}`,
      message: `Worker ${w.name} (${w.area}) hasn't uploaded today's cleaning photo`,
      type: 'warning',
      time: 'Today',
      read: false,
    })),
    {
      id: 'notif-comp1',
      title: '🚨 New Complaint',
      message: 'New complaint from Sellur area - Dustbin DB011 overflowing',
      type: 'alert',
      time: '10 min ago',
      read: false,
    },
    {
      id: 'notif-comp2',
      title: '✅ Complaint Resolved',
      message: 'Complaint at Avaniyapuram resolved by worker Malathi S',
      type: 'success',
      time: '1 hour ago',
      read: true,
    },
  ];

  const unreadCount = adminNotifications.filter(n => !n.read).length;

  const handleLogin = (role, name, phone = '', profile = null) => {
    setUserRole(role);
    setUserName(name);
    setUserPhone(phone);
    setUserProfileId(profile?.id || null);
    setIsLoggedIn(true);
    navigate('/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('citizen');
    setUserName('');
    setUserPhone('');
    setUserProfileId(null);
    navigate('/');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const pageTitle = t(pageTitles[location.pathname] || 'dashboard');

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h2>{pageTitle}</h2>
          </div>

          <div className="top-bar-actions">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder={t('search')} />
            </div>

            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                title={t('notifications')}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {unreadCount > 0 && <span className="notif-dot"></span>}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0,
                  width: 360, maxHeight: 420, overflowY: 'auto',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                  zIndex: 200, animation: 'fadeIn 0.2s ease',
                }}>
                  <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700 }}>
                      {t('notifications')} {unreadCount > 0 && `(${unreadCount})`}
                    </h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ background: 'none', color: 'var(--text-muted)', fontSize: 14, border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>

                  {adminNotifications.map(notif => (
                    <div key={notif.id} style={{
                      padding: '14px 20px', borderBottom: '1px solid var(--border)',
                      background: notif.read ? 'transparent' : 'rgba(16,185,129,0.03)',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(16,185,129,0.03)'}
                    >
                      <div style={{ display: 'flex', gap: 10 }}>
                        {!notif.read && (
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', marginTop: 5,
                            background: notif.type === 'warning' ? 'var(--warning)' :
                              notif.type === 'alert' ? 'var(--danger)' : 'var(--success)',
                            flexShrink: 0,
                          }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: notif.read ? 400 : 600, margin: 0, lineHeight: 1.4 }}>
                            {notif.title}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                            {notif.message}
                          </p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '6px 0 0' }}>
                            🕐 {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {adminNotifications.length === 0 && (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                      <p style={{ fontSize: 24, marginBottom: 8 }}>🔔</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 14px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: 'white',
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {userRole === 'admin' ? '👨‍💼' : userRole === 'worker' ? '👷' : '👤'} {userRole}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  fontSize: 16, cursor: 'pointer', padding: '4px', marginLeft: 4,
                }}
                title={t('logout')}
              >
                🚪
              </button>
            </div>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={
              userRole === 'citizen'
                ? <CitizenDashboard user={{ name: userName, role: userRole }} />
                : <Dashboard />
            } />
            <Route path="/map" element={<MapPage />} />
            <Route path="/complaints" element={<ComplaintsPage userRole={userRole} />} />
            <Route path="/workers" element={<WorkersPage userRole={userRole} />} />
            <Route path="/incharge" element={<InchargePage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </div>
      </main>

      <Chatbot />

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 150 }}
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
}
