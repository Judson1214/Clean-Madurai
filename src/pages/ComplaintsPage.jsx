import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { complaintsData } from '../data/appData';

// ===== Star Rating Component =====
function StarRating({ rating, onRate, size = 28, interactive = true }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => {
                const isFilled = star <= (hovered || rating);
                return (
                    <span
                        key={star}
                        onClick={() => interactive && onRate(star)}
                        onMouseEnter={() => interactive && setHovered(star)}
                        onMouseLeave={() => interactive && setHovered(0)}
                        style={{
                            fontSize: size,
                            cursor: interactive ? 'pointer' : 'default',
                            color: isFilled ? '#f0c040' : 'rgba(148,163,184,0.3)',
                            transition: 'all 0.15s ease',
                            transform: isFilled && interactive ? 'scale(1.15)' : 'scale(1)',
                            filter: isFilled ? 'drop-shadow(0 0 6px rgba(240,192,64,0.4))' : 'none',
                            userSelect: 'none',
                        }}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
}

// ===== Rating Labels =====
const ratingLabels = {
    1: '😞 Very Poor',
    2: '😕 Poor',
    3: '😐 Average',
    4: '😊 Good',
    5: '🌟 Excellent',
};

export default function ComplaintsPage({ userRole = 'citizen' }) {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('all');
    const [expandedId, setExpandedId] = useState(null);
    const [notifiedWorkers, setNotifiedWorkers] = useState({});
    const [toast, setToast] = useState(null);

    // Rating state: { complaintId: { rating, suggestion, submitted } }
    const [ratings, setRatings] = useState({});
    const [ratingInputs, setRatingInputs] = useState({});

    const isAdmin = userRole === 'admin' || userRole === 'incharge';
    const isCitizen = userRole === 'citizen';

    const filtered = filter === 'all'
        ? complaintsData
        : complaintsData.filter(c => c.status === filter);

    const counts = {
        all: complaintsData.length,
        pending: complaintsData.filter(c => c.status === 'pending').length,
        'in-progress': complaintsData.filter(c => c.status === 'in-progress').length,
        resolved: complaintsData.filter(c => c.status === 'resolved').length,
    };

    const handleNotifyWorker = (complaint) => {
        setNotifiedWorkers(prev => ({ ...prev, [complaint.id]: true }));
        setToast({
            message: `✅ Worker ${complaint.assignedWorker} has been notified about complaint #${complaint.id}`,
            type: 'success',
        });
        setTimeout(() => setToast(null), 4000);
    };

    const handleRatingChange = (complaintId, rating) => {
        setRatingInputs(prev => ({
            ...prev,
            [complaintId]: { ...(prev[complaintId] || {}), rating },
        }));
    };

    const handleSuggestionChange = (complaintId, suggestion) => {
        setRatingInputs(prev => ({
            ...prev,
            [complaintId]: { ...(prev[complaintId] || {}), suggestion },
        }));
    };

    const handleSubmitRating = (complaintId) => {
        const input = ratingInputs[complaintId];
        if (!input?.rating) {
            setToast({ message: '⚠️ Please select a star rating before submitting', type: 'error' });
            setTimeout(() => setToast(null), 3000);
            return;
        }

        // Save rating (in production: save to Supabase complaint_ratings table)
        setRatings(prev => ({
            ...prev,
            [complaintId]: {
                rating: input.rating,
                suggestion: input.suggestion || '',
                submitted: true,
                submittedAt: new Date().toLocaleString(),
            },
        }));

        setToast({
            message: `⭐ Thank you! Your ${input.rating}-star rating has been submitted successfully`,
            type: 'success',
        });
        setTimeout(() => setToast(null), 4000);
    };

    const getStatusStyle = (status) => {
        if (status === 'pending') return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: '🔴 ' + t('pending'), border: 'rgba(239,68,68,0.3)' };
        if (status === 'in-progress') return { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: '🟡 ' + t('inProgress'), border: 'rgba(245,158,11,0.3)' };
        return { bg: 'rgba(34,197,94,0.12)', color: '#2a9d8f', label: '🟢 ' + t('resolved'), border: 'rgba(34,197,94,0.3)' };
    };

    // Calculate average rating for admin view
    const getAvgRating = (complaintId) => {
        const r = ratings[complaintId];
        return r?.submitted ? r.rating : null;
    };

    return (
        <div>
            {/* Toast notification */}
            {toast && (
                <div style={{
                    position: 'fixed', top: 20, right: 20, zIndex: 9999,
                    padding: '14px 24px', borderRadius: 'var(--radius-lg)',
                    background: toast.type === 'success' ? 'rgba(34,197,94,0.95)' : 'rgba(239,68,68,0.95)',
                    color: 'white', fontSize: 14, fontWeight: 600,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    animation: 'fadeIn 0.3s ease', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', gap: 10,
                }}>
                    {toast.message}
                    <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer' }}>✕</button>
                </div>
            )}

            <div className="section-header">
                <h3>{t('complaintsTitle')}</h3>
                {isAdmin && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', background: 'rgba(168,85,247,0.1)',
                        borderRadius: 'var(--radius-full)', fontSize: 12, color: '#a855f7', fontWeight: 600,
                    }}>
                        👁️ Admin View — Phone numbers visible
                    </div>
                )}
                {isCitizen && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', background: 'rgba(240,192,64,0.1)',
                        borderRadius: 'var(--radius-full)', fontSize: 12, color: '#f0c040', fontWeight: 600,
                    }}>
                        ⭐ Rate resolved complaints below
                    </div>
                )}
            </div>

            {/* Summary cards */}
            {isAdmin && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Total', count: counts.all, icon: '📋', color: 'var(--primary)' },
                        { label: 'Pending', count: counts.pending, icon: '🔴', color: '#ef4444' },
                        { label: 'In Progress', count: counts['in-progress'], icon: '🟡', color: '#f59e0b' },
                        { label: 'Resolved', count: counts.resolved, icon: '🟢', color: '#2a9d8f' },
                    ].map(s => (
                        <div key={s.label} style={{
                            padding: '16px 20px', background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                            borderTop: `3px solid ${s.color}`,
                        }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.icon} {s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="table-container">
                <div className="table-header">
                    <h3>📋 {filtered.length} complaints</h3>
                    <div className="filter-pills">
                        <button className={`filter-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>{t('all')} ({counts.all})</button>
                        <button className={`filter-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>{t('pending')} ({counts.pending})</button>
                        <button className={`filter-pill ${filter === 'in-progress' ? 'active' : ''}`} onClick={() => setFilter('in-progress')}>{t('inProgress')} ({counts['in-progress']})</button>
                        <button className={`filter-pill ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>{t('resolved')} ({counts.resolved})</button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>{t('dustbinId')}</th>
                                <th>{t('area')}</th>
                                <th>{t('description')}</th>
                                <th>{t('status')}</th>
                                {isAdmin && <th>📱 Reporter</th>}
                                {isAdmin && <th>👷 Worker</th>}
                                <th>{t('reportedAt')}</th>
                                {isAdmin && <th>⭐ Rating</th>}
                                {isAdmin && <th>Actions</th>}
                                {isCitizen && <th>⭐ Your Rating</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => {
                                const status = getStatusStyle(c.status);
                                const isExpanded = expandedId === c.id;
                                const isNotified = notifiedWorkers[c.id];
                                const existingRating = ratings[c.id];
                                const avgRating = getAvgRating(c.id);

                                return (
                                    <>
                                        <tr key={c.id}
                                            onClick={() => setExpandedId(isExpanded ? null : c.id)}
                                            style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                                        >
                                            <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{c.id}</td>
                                            <td style={{ fontWeight: 600 }}>{c.dustbinId}</td>
                                            <td>{c.area}</td>
                                            <td style={{ maxWidth: 200, color: 'var(--text-secondary)', fontSize: 13 }}>{c.description}</td>
                                            <td>
                                                <span style={{
                                                    padding: '5px 12px', borderRadius: 'var(--radius-full)',
                                                    fontSize: 12, fontWeight: 600,
                                                    background: status.bg, color: status.color,
                                                    border: `1px solid ${status.border}`,
                                                }}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.reporter}</div>
                                                    <a href={`tel:+91${c.reporterPhone}`} style={{
                                                        fontSize: 12, color: '#3b82f6', textDecoration: 'none',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                    }}>
                                                        📱 {c.reporterPhone}
                                                    </a>
                                                </td>
                                            )}
                                            {isAdmin && (
                                                <td>
                                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.assignedWorker}</div>
                                                    <a href={`tel:+91${c.assignedWorkerPhone}`} style={{
                                                        fontSize: 12, color: '#2a9d8f', textDecoration: 'none',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                    }}>
                                                        📞 {c.assignedWorkerPhone}
                                                    </a>
                                                </td>
                                            )}
                                            <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.reportedAt}</td>

                                            {/* Admin: show rating column */}
                                            {isAdmin && (
                                                <td>
                                                    {avgRating ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                            <StarRating rating={avgRating} onRate={() => { }} size={16} interactive={false} />
                                                            <span style={{ fontSize: 12, color: '#f0c040', fontWeight: 700 }}>{avgRating}/5</span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                            {c.status === 'resolved' ? '⏳ Awaiting' : '—'}
                                                        </span>
                                                    )}
                                                </td>
                                            )}

                                            {isAdmin && (
                                                <td>
                                                    {c.status !== 'resolved' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleNotifyWorker(c); }}
                                                            disabled={isNotified}
                                                            style={{
                                                                padding: '6px 14px', borderRadius: 'var(--radius-md)',
                                                                fontSize: 11, fontWeight: 700, cursor: isNotified ? 'default' : 'pointer',
                                                                background: isNotified ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                                color: isNotified ? '#2a9d8f' : '#ef4444',
                                                                border: `1px solid ${isNotified ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                                transition: 'all 0.2s',
                                                            }}
                                                        >
                                                            {isNotified ? '✅ Notified' : '🔔 Notify Worker'}
                                                        </button>
                                                    )}
                                                </td>
                                            )}

                                            {/* Citizen: show rating column */}
                                            {isCitizen && (
                                                <td onClick={e => e.stopPropagation()}>
                                                    {c.status === 'resolved' ? (
                                                        existingRating?.submitted ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <StarRating rating={existingRating.rating} onRate={() => { }} size={16} interactive={false} />
                                                                <span style={{
                                                                    fontSize: 11, color: '#2a9d8f', fontWeight: 700,
                                                                    padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                                    background: 'rgba(34,197,94,0.1)',
                                                                }}>
                                                                    ✅ Rated
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                                                                style={{
                                                                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                                                                    fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                                    background: 'rgba(240,192,64,0.1)',
                                                                    color: '#f0c040',
                                                                    border: '1px solid rgba(240,192,64,0.3)',
                                                                    transition: 'all 0.2s',
                                                                    animation: 'pulse-badge 2s infinite',
                                                                }}
                                                            >
                                                                ⭐ Rate Now
                                                            </button>
                                                        )
                                                    ) : (
                                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>

                                        {/* ===== Expanded Detail Card ===== */}
                                        {isExpanded && (
                                            <tr key={`${c.id}-detail`}>
                                                <td colSpan={isAdmin ? 11 : (isCitizen ? 7 : 6)} style={{ padding: 0 }}>
                                                    <div style={{
                                                        padding: '20px 24px', background: 'rgba(30,41,59,0.5)',
                                                        borderTop: '1px solid var(--border)',
                                                        animation: 'fadeIn 0.2s ease',
                                                    }}>
                                                        {/* Admin expanded detail */}
                                                        {isAdmin && (
                                                            <>
                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                                                                    {/* Reporter Info */}
                                                                    <div style={{
                                                                        padding: 16, borderRadius: 'var(--radius-md)',
                                                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                                    }}>
                                                                        <h5 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                                                            👤 REPORTER DETAILS
                                                                        </h5>
                                                                        <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{c.reporter}</p>
                                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                                            <a href={`tel:+91${c.reporterPhone}`} style={{
                                                                                padding: '6px 14px', borderRadius: 'var(--radius-md)',
                                                                                background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                                                                                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                                                                border: '1px solid rgba(59,130,246,0.2)',
                                                                                display: 'flex', alignItems: 'center', gap: 4,
                                                                            }}>
                                                                                📞 Call {c.reporterPhone}
                                                                            </a>
                                                                        </div>
                                                                    </div>

                                                                    {/* Worker Info */}
                                                                    <div style={{
                                                                        padding: 16, borderRadius: 'var(--radius-md)',
                                                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                                    }}>
                                                                        <h5 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                                                            👷 ASSIGNED WORKER
                                                                        </h5>
                                                                        <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>{c.assignedWorker}</p>
                                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                                            <a href={`tel:+91${c.assignedWorkerPhone}`} style={{
                                                                                padding: '6px 14px', borderRadius: 'var(--radius-md)',
                                                                                background: 'rgba(16,185,129,0.1)', color: '#2a9d8f',
                                                                                fontSize: 12, fontWeight: 600, textDecoration: 'none',
                                                                                border: '1px solid rgba(16,185,129,0.2)',
                                                                                display: 'flex', alignItems: 'center', gap: 4,
                                                                            }}>
                                                                                📞 Call {c.assignedWorkerPhone}
                                                                            </a>
                                                                        </div>
                                                                    </div>

                                                                    {/* Complaint Info */}
                                                                    <div style={{
                                                                        padding: 16, borderRadius: 'var(--radius-md)',
                                                                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                                    }}>
                                                                        <h5 style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>
                                                                            📋 COMPLAINT DETAILS
                                                                        </h5>
                                                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                                                                            {c.description}
                                                                        </p>
                                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                                            <span style={{
                                                                                padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-full)',
                                                                                background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                                                            }}>🗑️ {c.dustbinId}</span>
                                                                            <span style={{
                                                                                padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-full)',
                                                                                background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                                                            }}>📍 {c.area}</span>
                                                                            <span style={{
                                                                                padding: '4px 10px', fontSize: 11, borderRadius: 'var(--radius-full)',
                                                                                background: 'var(--bg-surface)', color: 'var(--text-muted)',
                                                                            }}>🕐 {c.reportedAt}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Admin: citizen rating display */}
                                                                {existingRating?.submitted && (
                                                                    <div style={{
                                                                        marginTop: 16, padding: 16, borderRadius: 'var(--radius-md)',
                                                                        background: 'rgba(240,192,64,0.05)', border: '1px solid rgba(240,192,64,0.15)',
                                                                    }}>
                                                                        <h5 style={{ fontSize: 12, color: '#f0c040', marginBottom: 10, fontWeight: 600 }}>
                                                                            ⭐ CITIZEN RATING & FEEDBACK
                                                                        </h5>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                                                            <StarRating rating={existingRating.rating} onRate={() => { }} size={22} interactive={false} />
                                                                            <span style={{ fontSize: 16, fontWeight: 800, color: '#f0c040' }}>{existingRating.rating}/5</span>
                                                                            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ratingLabels[existingRating.rating]}</span>
                                                                        </div>
                                                                        {existingRating.suggestion && (
                                                                            <div style={{
                                                                                padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                                                                background: 'var(--bg-card)', fontSize: 13, color: 'var(--text-secondary)',
                                                                                lineHeight: 1.5, fontStyle: 'italic',
                                                                            }}>
                                                                                💬 "{existingRating.suggestion}"
                                                                            </div>
                                                                        )}
                                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                                                            Submitted: {existingRating.submittedAt}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Action buttons */}
                                                                {c.status !== 'resolved' && (
                                                                    <div style={{
                                                                        display: 'flex', gap: 10, marginTop: 16,
                                                                        paddingTop: 16, borderTop: '1px solid var(--border)',
                                                                    }}>
                                                                        <button
                                                                            onClick={() => handleNotifyWorker(c)}
                                                                            disabled={notifiedWorkers[c.id]}
                                                                            style={{
                                                                                padding: '10px 20px', borderRadius: 'var(--radius-md)',
                                                                                fontSize: 13, fontWeight: 700,
                                                                                cursor: notifiedWorkers[c.id] ? 'default' : 'pointer',
                                                                                background: notifiedWorkers[c.id] ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.15)',
                                                                                color: notifiedWorkers[c.id] ? '#2a9d8f' : '#ef4444',
                                                                                border: `1px solid ${notifiedWorkers[c.id] ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                                                            }}
                                                                        >
                                                                            {notifiedWorkers[c.id] ? '✅ Worker Notified' : '🔔 Notify Worker About This Complaint'}
                                                                        </button>
                                                                        <a href={`tel:+91${c.assignedWorkerPhone}`} style={{
                                                                            padding: '10px 20px', borderRadius: 'var(--radius-md)',
                                                                            fontSize: 13, fontWeight: 700, textDecoration: 'none',
                                                                            background: 'rgba(16,185,129,0.15)', color: '#2a9d8f',
                                                                            border: '1px solid rgba(16,185,129,0.3)',
                                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                                        }}>
                                                                            📞 Call Worker: {c.assignedWorker}
                                                                        </a>
                                                                        <a href={`tel:+91${c.reporterPhone}`} style={{
                                                                            padding: '10px 20px', borderRadius: 'var(--radius-md)',
                                                                            fontSize: 13, fontWeight: 700, textDecoration: 'none',
                                                                            background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
                                                                            border: '1px solid rgba(59,130,246,0.3)',
                                                                            display: 'flex', alignItems: 'center', gap: 6,
                                                                        }}>
                                                                            📱 Call Citizen: {c.reporter}
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        {/* ===== CITIZEN RATING CARD ===== */}
                                                        {isCitizen && c.status === 'resolved' && (
                                                            <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                                                {existingRating?.submitted ? (
                                                                    /* Already rated — show thank you card */
                                                                    <div style={{
                                                                        padding: '28px 24px', borderRadius: 'var(--radius-lg)',
                                                                        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(240,192,64,0.05))',
                                                                        border: '1px solid rgba(34,197,94,0.2)',
                                                                        textAlign: 'center',
                                                                    }}>
                                                                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                                                                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#2a9d8f' }}>
                                                                            Thank You for Your Feedback!
                                                                        </h4>
                                                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                                                                            <StarRating rating={existingRating.rating} onRate={() => { }} size={32} interactive={false} />
                                                                        </div>
                                                                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 6 }}>
                                                                            {ratingLabels[existingRating.rating]}
                                                                        </p>
                                                                        {existingRating.suggestion && (
                                                                            <p style={{
                                                                                fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)',
                                                                                padding: '8px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                                                                                display: 'inline-block', marginTop: 8,
                                                                            }}>
                                                                                💬 "{existingRating.suggestion}"
                                                                            </p>
                                                                        )}
                                                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                                                                            Submitted on {existingRating.submittedAt}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* Rating form */
                                                                    <div style={{
                                                                        padding: '28px 24px', borderRadius: 'var(--radius-lg)',
                                                                        background: 'linear-gradient(135deg, rgba(240,192,64,0.06), rgba(16,185,129,0.04))',
                                                                        border: '1px solid rgba(240,192,64,0.15)',
                                                                    }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                                            <span style={{ fontSize: 28 }}>⭐</span>
                                                                            <div>
                                                                                <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Rate This Resolution</h4>
                                                                                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                                                                                    Complaint #{c.id} — {c.area} — {c.description}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {/* Star Selector */}
                                                                        <div style={{
                                                                            padding: '20px', borderRadius: 'var(--radius-md)',
                                                                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                                            marginBottom: 16, textAlign: 'center',
                                                                        }}>
                                                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                                                                                How would you rate the cleanup work?
                                                                            </p>
                                                                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                                                                                <StarRating
                                                                                    rating={ratingInputs[c.id]?.rating || 0}
                                                                                    onRate={(r) => handleRatingChange(c.id, r)}
                                                                                    size={40}
                                                                                />
                                                                            </div>
                                                                            {ratingInputs[c.id]?.rating > 0 && (
                                                                                <div style={{
                                                                                    fontSize: 14, fontWeight: 700, marginTop: 6,
                                                                                    color: ratingInputs[c.id].rating >= 4 ? '#2a9d8f' : ratingInputs[c.id].rating >= 3 ? '#f59e0b' : '#ef4444',
                                                                                    animation: 'fadeIn 0.2s ease',
                                                                                }}>
                                                                                    {ratingLabels[ratingInputs[c.id].rating]}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Suggestion text area */}
                                                                        <div style={{ marginBottom: 16 }}>
                                                                            <label style={{
                                                                                display: 'block', fontSize: 13, fontWeight: 600,
                                                                                color: 'var(--text-secondary)', marginBottom: 8,
                                                                            }}>
                                                                                💬 Your Suggestions (Optional)
                                                                            </label>
                                                                            <textarea
                                                                                value={ratingInputs[c.id]?.suggestion || ''}
                                                                                onChange={(e) => handleSuggestionChange(c.id, e.target.value)}
                                                                                placeholder="Share your feedback about the cleanup... e.g., 'Work was done quickly but area still needs regular maintenance'"
                                                                                rows={3}
                                                                                style={{
                                                                                    width: '100%', padding: '12px 16px',
                                                                                    background: 'var(--bg-input)', color: 'var(--text-primary)',
                                                                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                                                                    fontSize: 13, lineHeight: 1.6, resize: 'vertical',
                                                                                    fontFamily: 'inherit',
                                                                                    transition: 'border-color 0.2s',
                                                                                }}
                                                                                onFocus={(e) => e.target.style.borderColor = 'rgba(240,192,64,0.5)'}
                                                                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                                                            />
                                                                        </div>

                                                                        {/* Submit button */}
                                                                        <button
                                                                            onClick={() => handleSubmitRating(c.id)}
                                                                            disabled={!ratingInputs[c.id]?.rating}
                                                                            style={{
                                                                                width: '100%', padding: '14px 24px',
                                                                                borderRadius: 'var(--radius-md)',
                                                                                fontSize: 15, fontWeight: 700,
                                                                                cursor: ratingInputs[c.id]?.rating ? 'pointer' : 'not-allowed',
                                                                                background: ratingInputs[c.id]?.rating
                                                                                    ? 'linear-gradient(135deg, #d4a012, #e8783a)'
                                                                                    : 'rgba(148,163,184,0.15)',
                                                                                color: ratingInputs[c.id]?.rating ? 'white' : 'var(--text-muted)',
                                                                                border: 'none',
                                                                                transition: 'all 0.3s ease',
                                                                                boxShadow: ratingInputs[c.id]?.rating
                                                                                    ? '0 4px 16px rgba(212,160,18,0.3)'
                                                                                    : 'none',
                                                                            }}
                                                                        >
                                                                            {ratingInputs[c.id]?.rating
                                                                                ? `⭐ Submit ${ratingInputs[c.id].rating}-Star Rating`
                                                                                : 'Select a rating above'}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Citizen: not resolved — show info */}
                                                        {isCitizen && c.status !== 'resolved' && (
                                                            <div style={{
                                                                padding: '20px 24px', borderRadius: 'var(--radius-md)',
                                                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                                                textAlign: 'center',
                                                            }}>
                                                                <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
                                                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                                                                    Complaint In Progress
                                                                </h4>
                                                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                                    You can rate and provide feedback once this complaint is resolved.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filtered.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🎉</div>
                        <h4>No complaints found</h4>
                        <p>Great! There are no complaints matching this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
