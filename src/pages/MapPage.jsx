import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import DustbinMap from '../components/DustbinMap';
import { dustbinData, vehiclesData } from '../data/appData';

export default function MapPage() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dustbins, setDustbins] = useState(dustbinData);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [selectedBin, setSelectedBin] = useState(null);
    const [showRoutes, setShowRoutes] = useState(false);

    // Simulate real-time status updates every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setLastUpdated(new Date());
            // In production, this would fetch from Supabase with real-time subscription
            // supabase.from('dustbins').select('*').then(...)
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Filter dustbins
    const filtered = dustbins.filter(bin => {
        const matchesFilter = filter === 'all' || bin.status === filter;
        const matchesSearch = !searchQuery ||
            bin.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bin.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bin.incharge.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const counts = {
        all: dustbins.length,
        clean: dustbins.filter(d => d.status === 'clean').length,
        partial: dustbins.filter(d => d.status === 'partial').length,
        full: dustbins.filter(d => d.status === 'full').length,
    };

    return (
        <div>
            {/* Header with search and filters */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 20, flexWrap: 'wrap', gap: 12,
            }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t('dustbinMap')}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%', background: '#2a9d8f',
                            display: 'inline-block', animation: 'pulse-badge 2s infinite',
                        }}></span>
                        Live • Updated {lastUpdated.toLocaleTimeString('en-IN')}
                    </p>
                </div>

                {/* Search */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-full)', padding: '8px 16px', minWidth: 260,
                }}>
                    <span>🔍</span>
                    <input
                        type="text"
                        placeholder="Search area, dustbin ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-primary)', fontSize: 13, width: '100%',
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: 14,
                            }}
                        >✕</button>
                    )}
                </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <button
                    className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    🗺️ {t('all')} ({counts.all})
                </button>
                <button
                    className={`filter-pill ${filter === 'clean' ? 'active' : ''}`}
                    onClick={() => setFilter('clean')}
                    style={filter === 'clean' ? {} : { borderColor: 'rgba(34,197,94,0.3)', color: '#2a9d8f' }}
                >
                    🟢 {t('mapLegendClean')} ({counts.clean})
                </button>
                <button
                    className={`filter-pill ${filter === 'partial' ? 'active' : ''}`}
                    onClick={() => setFilter('partial')}
                    style={filter === 'partial' ? {} : { borderColor: 'rgba(245,158,11,0.3)', color: '#f59e0b' }}
                >
                    🟡 {t('mapLegendPartial')} ({counts.partial})
                </button>
                <button
                    className={`filter-pill ${filter === 'full' ? 'active' : ''}`}
                    onClick={() => setFilter('full')}
                    style={filter === 'full' ? {} : { borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                >
                    🔴 {t('mapLegendFull')} ({counts.full})
                </button>

                {/* Vehicle Routes Toggle */}
                <button
                    className={`filter-pill ${showRoutes ? 'active' : ''}`}
                    onClick={() => setShowRoutes(!showRoutes)}
                    style={showRoutes ? {} : { borderColor: 'rgba(59,130,246,0.3)', color: '#3b82f6' }}
                >
                    🚛 Vehicle Routes {showRoutes ? '(ON)' : '(OFF)'}
                </button>
            </div>

            {/* Map */}
            <DustbinMap
                dustbins={filtered}
                onMarkerClick={setSelectedBin}
                showUserLocation={true}
                height={520}
                vehicles={vehiclesData}
                showRoutes={showRoutes}
            />

            {/* Dustbin List */}
            <div className="table-container" style={{ marginTop: 24 }}>
                <div className="table-header">
                    <h3>🗑️ {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Dustbins ({filtered.length})</h3>
                    {searchQuery && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Searching: "{searchQuery}"
                        </span>
                    )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('dustbinId')}</th>
                                <th>{t('area')}</th>
                                <th>Zone</th>
                                <th>{t('status')}</th>
                                <th>Incharge</th>
                                <th>Coordinates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(bin => (
                                <tr
                                    key={bin.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedBin(bin)}
                                >
                                    <td style={{ fontWeight: 600 }}>{bin.id}</td>
                                    <td>{bin.area}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{bin.zone}</td>
                                    <td>
                                        <span className={`status-badge ${bin.status === 'full' ? 'pending' : bin.status === 'partial' ? 'in-progress' : 'resolved'}`}>
                                            <span className="dot"></span>
                                            {bin.status === 'full' ? '🔴 Full' : bin.status === 'partial' ? '🟡 Partial' : '🟢 Clean'}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{bin.incharge}</td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                        {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h4>No dustbins found</h4>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
