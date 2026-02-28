import { useLanguage } from '../context/LanguageContext';
import { inchargeData } from '../data/appData';

export default function InchargePage() {
    const { t } = useLanguage();

    return (
        <div>
            <div className="section-header">
                <h3>{t('inchargeTitle')}</h3>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {inchargeData.length} Officers Managing {inchargeData.reduce((acc, i) => acc + i.totalBins, 0)} Dustbins
                </span>
            </div>

            <div className="incharge-grid">
                {inchargeData.map(officer => (
                    <div className="incharge-card" key={officer.id}>
                        <div className="incharge-header">
                            <div className="incharge-avatar">
                                {officer.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="incharge-name">{officer.name}</div>
                                <div className="incharge-role">{officer.area}</div>
                            </div>
                        </div>

                        <div className="incharge-stats">
                            <div className="incharge-stat">
                                <div className="value">{officer.totalBins}</div>
                                <div className="label">{t('totalBins')}</div>
                            </div>
                            <div className="incharge-stat">
                                <div className="value" style={{ color: officer.pending > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                    {officer.pending}
                                </div>
                                <div className="label">{t('pendingLabel')}</div>
                            </div>
                            <div className="incharge-stat">
                                <div className="value" style={{ color: 'var(--success)' }}>{officer.resolved}</div>
                                <div className="label">{t('resolvedLabel')}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                                Managed Areas
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {officer.areas.map((area, i) => (
                                    <span key={i} className="area-tag">📍 {area}</span>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                            <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                                📞 {officer.phone}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
