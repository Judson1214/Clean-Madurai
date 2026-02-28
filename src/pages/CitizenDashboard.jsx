import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Demo data - will be replaced with Supabase data once connected
const demoComplaints = [
    {
        id: 'C001',
        dustbinId: 'DB002',
        area: 'Periyar Bus Stand',
        description: 'Dustbin overflowing, waste scattered around',
        status: 'in-progress',
        created_at: '2026-02-27 09:30',
        actions: [
            { action: 'Complaint received and assigned to Zone 1 incharge', status: 'pending', created_at: '2026-02-27 09:35' },
            { action: 'Worker Priya Devi dispatched to location', status: 'in-progress', created_at: '2026-02-27 10:00' },
        ],
    },
    {
        id: 'C002',
        dustbinId: 'DB007',
        area: 'Goripalayam',
        description: 'Dustbin not cleaned for 2 days',
        status: 'resolved',
        created_at: '2026-02-26 07:45',
        actions: [
            { action: 'Complaint received', status: 'pending', created_at: '2026-02-26 07:50' },
            { action: 'Worker Malathi S assigned', status: 'in-progress', created_at: '2026-02-26 08:30' },
            { action: 'Dustbin cleaned and area sanitized. Photo uploaded.', status: 'resolved', created_at: '2026-02-26 10:15' },
        ],
    },
    {
        id: 'C003',
        dustbinId: 'DB011',
        area: 'Sellur',
        description: 'Waste overflowing onto the road',
        status: 'pending',
        created_at: '2026-02-27 10:00',
        actions: [
            { action: 'Complaint received. Awaiting assignment.', status: 'pending', created_at: '2026-02-27 10:05' },
        ],
    },
];

export default function CitizenDashboard({ user }) {
    const { t } = useLanguage();
    const [expandedComplaint, setExpandedComplaint] = useState(null);

    const citizenInfo = {
        name: user?.name || 'Ramesh Kumar',
        phone: user?.phone || '9876543200',
        area: user?.area || 'Sellur, Madurai',
    };

    const toggleComplaint = (id) => {
        setExpandedComplaint(expandedComplaint === id ? null : id);
    };

    const getStatusColor = (status) => {
        if (status === 'pending') return '#ef4444';
        if (status === 'in-progress') return '#f59e0b';
        return '#2a9d8f';
    };

    const getStatusIcon = (status) => {
        if (status === 'pending') return '🔴';
        if (status === 'in-progress') return '🟡';
        return '🟢';
    };

    return (
        <div>
            {/* Citizen Profile Card */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '32px',
                marginBottom: '28px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, color: 'white', fontWeight: 700,
                        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                    }}>
                        {citizenInfo.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{citizenInfo.name}</h2>
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                                <span>📞</span>
                                <span>{citizenInfo.phone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
                                <span>📍</span>
                                <span>{citizenInfo.area}</span>
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                background: 'rgba(16,185,129,0.15)', color: 'var(--primary-light)',
                                fontSize: 12, fontWeight: 600,
                            }}>
                                👤 {t('citizen')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16, marginBottom: 28,
            }}>
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{demoComplaints.length}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Total Complaints</div>
                </div>
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)' }}>
                        {demoComplaints.filter(c => c.status === 'pending').length}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('pending')}</div>
                </div>
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)' }}>
                        {demoComplaints.filter(c => c.status === 'in-progress').length}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('inProgress')}</div>
                </div>
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>
                        {demoComplaints.filter(c => c.status === 'resolved').length}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{t('resolved')}</div>
                </div>
            </div>

            {/* My Complaints - with action tracking */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>📋 My Complaints & Action Reports</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Click a complaint to see actions taken
                    </span>
                </div>

                {demoComplaints.map(complaint => (
                    <div key={complaint.id}>
                        {/* Complaint Row */}
                        <div
                            onClick={() => toggleComplaint(complaint.id)}
                            style={{
                                padding: '16px 24px',
                                borderBottom: '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease',
                                background: expandedComplaint === complaint.id ? 'var(--bg-surface)' : 'transparent',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = expandedComplaint === complaint.id ? 'var(--bg-surface)' : 'transparent'}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                                    background: `${getStatusColor(complaint.status)}22`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18,
                                }}>
                                    {getStatusIcon(complaint.status)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{complaint.area}</span>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                            fontSize: 11, fontWeight: 600,
                                            background: `${getStatusColor(complaint.status)}22`,
                                            color: getStatusColor(complaint.status),
                                        }}>
                                            {complaint.status === 'pending' ? t('pending') :
                                                complaint.status === 'in-progress' ? t('inProgress') : t('resolved')}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                                        {complaint.description}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{complaint.dustbinId}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{complaint.created_at}</div>
                                </div>
                                <span style={{
                                    fontSize: 14, transform: expandedComplaint === complaint.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease',
                                }}>
                                    ▼
                                </span>
                            </div>
                        </div>

                        {/* Expanded Actions Timeline */}
                        {expandedComplaint === complaint.id && (
                            <div style={{
                                padding: '20px 24px 20px 80px',
                                background: 'var(--bg-surface)',
                                borderBottom: '1px solid var(--border)',
                                animation: 'fadeIn 0.3s ease',
                            }}>
                                <div style={{
                                    fontSize: 12, fontWeight: 700, color: 'var(--text-muted)',
                                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
                                }}>
                                    ⚡ Actions Taken
                                </div>
                                <div style={{ position: 'relative' }}>
                                    {/* Timeline line */}
                                    <div style={{
                                        position: 'absolute', left: 11, top: 8, bottom: 8,
                                        width: 2, background: 'var(--border)',
                                    }} />

                                    {complaint.actions.map((action, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex', gap: 16, marginBottom: idx < complaint.actions.length - 1 ? 16 : 0,
                                            position: 'relative',
                                        }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: '50%',
                                                background: idx === complaint.actions.length - 1 ? getStatusColor(action.status) : 'var(--bg-card)',
                                                border: `2px solid ${getStatusColor(action.status)}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 10, color: 'white', zIndex: 1, flexShrink: 0,
                                            }}>
                                                {idx === complaint.actions.length - 1 ? '●' : ''}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{action.action}</p>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                                                    {action.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {complaint.status !== 'resolved' && (
                                    <div style={{
                                        marginTop: 16, padding: '10px 14px',
                                        background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-sm)',
                                        fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        ⏳ Your complaint is being processed. Updates will appear here.
                                    </div>
                                )}

                                {complaint.status === 'resolved' && (
                                    <div style={{
                                        marginTop: 16, padding: '10px 14px',
                                        background: 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-sm)',
                                        fontSize: 12, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        ✅ This complaint has been resolved. Thank you for keeping Madurai clean!
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {demoComplaints.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                        <h4 style={{ fontSize: 16, marginBottom: 4 }}>No complaints yet</h4>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            You haven't filed any complaints. Report an issue from the sidebar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
