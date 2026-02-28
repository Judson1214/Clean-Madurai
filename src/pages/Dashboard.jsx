import { useLanguage } from '../context/LanguageContext';
import { dustbinData, complaintsData, workersData } from '../data/appData';
import DustbinMap from '../components/DustbinMap';

export default function Dashboard() {
    const { t } = useLanguage();

    const totalBins = dustbinData.length;
    const activeComplaints = complaintsData.filter(c => c.status !== 'resolved').length;
    const activeWorkers = workersData.filter(w => w.status === 'active').length;
    const resolvedToday = complaintsData.filter(c => c.status === 'resolved' && c.reportedAt.includes('2026-02-27')).length;
    const fullBins = dustbinData.filter(d => d.status === 'full').length;

    const recentComplaints = complaintsData.slice(0, 5);

    return (
        <div>
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon green">🗑️</div>
                    <div className="stat-value">{totalBins}</div>
                    <div className="stat-label">{t('totalDustbins')}</div>
                    <div className="stat-change up">↑ 4 new this month</div>
                </div>

                <div className="stat-card danger">
                    <div className="stat-icon red">⚠️</div>
                    <div className="stat-value">{activeComplaints}</div>
                    <div className="stat-label">{t('activeComplaints')}</div>
                    <div className="stat-change down">↑ {fullBins} bins full</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon blue">👷</div>
                    <div className="stat-value">{activeWorkers}</div>
                    <div className="stat-label">{t('workersOnDuty')}</div>
                    <div className="stat-change up">↑ 95% attendance</div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon yellow">✅</div>
                    <div className="stat-value">{resolvedToday}</div>
                    <div className="stat-label">{t('resolvedToday')}</div>
                    <div className="stat-change up">↑ Great progress!</div>
                </div>
            </div>

            {/* Map */}
            <DustbinMap dustbins={dustbinData} />

            {/* Recent Complaints */}
            <div className="table-container" style={{ marginTop: 32 }}>
                <div className="table-header">
                    <h3>{t('complaintsTitle')}</h3>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('dustbinId')}</th>
                            <th>{t('area')}</th>
                            <th>{t('status')}</th>
                            <th>{t('reportedAt')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentComplaints.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontWeight: 600 }}>{c.dustbinId}</td>
                                <td>{c.area}</td>
                                <td>
                                    <span className={`status-badge ${c.status}`}>
                                        <span className="dot"></span>
                                        {c.status === 'pending' ? t('pending') :
                                            c.status === 'in-progress' ? t('inProgress') :
                                                t('resolved')}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.reportedAt}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
