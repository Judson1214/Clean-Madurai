import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { complaintsData } from '../data/appData';

export default function Sidebar({ isOpen, onClose, userRole }) {
    const location = useLocation();
    const { t, lang, toggleLang } = useLanguage();
    const pendingCount = complaintsData.filter(c => c.status === 'pending').length;

    const navItems = [
        { path: '/', icon: '📊', label: t('dashboard'), roles: ['admin', 'citizen', 'worker'] },
        { path: '/map', icon: '🗺️', label: t('dustbinMap'), roles: ['admin', 'citizen', 'worker'] },
        { path: '/complaints', icon: '📋', label: t('complaints'), badge: pendingCount, roles: ['admin', 'citizen'] },
        { path: '/workers', icon: '👷', label: t('workers'), roles: ['admin', 'worker'] },
        { path: '/incharge', icon: '👨‍💼', label: t('areaIncharge'), roles: ['admin'] },
        { path: '/report', icon: '🚨', label: t('reportIssue'), roles: ['admin', 'citizen'] },
    ];

    const filteredItems = navItems.filter(item => item.roles.includes(userRole));

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src="/jallikattu-logo.png" alt="Clean Madurai Logo" className="logo-icon" style={{ objectFit: 'contain', padding: '4px' }} />
                        <div>
                            <h1>{t('appName')}</h1>
                            <span className="subtitle">{t('appSubtitle')}</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section-title">MENU</div>
                    {filteredItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge > 0 && <span className="badge">{item.badge}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="lang-toggle">
                        <button
                            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                            onClick={() => toggleLang('en')}
                        >
                            {t('english')}
                        </button>
                        <button
                            className={`lang-btn ${lang === 'ta' ? 'active' : ''}`}
                            onClick={() => toggleLang('ta')}
                        >
                            {t('tamil')}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
