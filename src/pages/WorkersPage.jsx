import { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { workersData, vehiclesData } from '../data/appData';

// Demo task/complaint assignments for workers
const workerTasks = [
    { id: 'T001', workerId: 'W001', dustbinId: 'DB001', area: 'Meenakshi Amman Temple', task: 'Daily cleaning', status: 'completed', assignedAt: '2026-02-27 06:00', completedAt: '2026-02-27 08:30' },
    { id: 'T002', workerId: 'W002', dustbinId: 'DB002', area: 'Periyar Bus Stand', task: 'Complaint: Dustbin overflowing', status: 'in-progress', assignedAt: '2026-02-27 09:30', completedAt: null },
    { id: 'T003', workerId: 'W003', dustbinId: 'DB003', area: 'Anna Nagar', task: 'Daily cleaning', status: 'pending', assignedAt: '2026-02-27 06:00', completedAt: null },
    { id: 'T004', workerId: 'W004', dustbinId: 'DB004', area: 'Mattuthavani Bus Stand', task: 'Complaint: Foul smell reported', status: 'pending', assignedAt: '2026-02-27 08:15', completedAt: null },
    { id: 'T005', workerId: 'W005', dustbinId: 'DB005', area: 'K.K. Nagar', task: 'Daily cleaning', status: 'completed', assignedAt: '2026-02-27 06:00', completedAt: '2026-02-27 09:15' },
    { id: 'T006', workerId: 'W006', dustbinId: 'DB007', area: 'Goripalayam', task: 'Complaint: Not cleaned for 2 days', status: 'in-progress', assignedAt: '2026-02-27 07:45', completedAt: null },
    { id: 'T007', workerId: 'W007', dustbinId: 'DB011', area: 'Sellur', task: 'Complaint: Waste overflowing', status: 'pending', assignedAt: '2026-02-27 10:00', completedAt: null },
    { id: 'T008', workerId: 'W008', dustbinId: 'DB015', area: 'Thirunagar', task: 'Complaint: Animals scavenging', status: 'pending', assignedAt: '2026-02-26 16:30', completedAt: null },
    { id: 'T009', workerId: 'W001', dustbinId: 'DB016', area: 'Ellis Nagar', task: 'Daily cleaning', status: 'completed', assignedAt: '2026-02-27 06:00', completedAt: '2026-02-27 07:45' },
    { id: 'T010', workerId: 'W005', dustbinId: 'DB013', area: 'Villapuram', task: 'Daily cleaning', status: 'in-progress', assignedAt: '2026-02-27 06:00', completedAt: null },
];

export default function WorkersPage({ userRole }) {
    const { t } = useLanguage();
    const [workers, setWorkers] = useState(workersData.map(w => ({
        ...w,
        verified: w.photoUploaded ? Math.random() > 0.5 : false,
        photoPreview: null,
        photoFile: null,
    })));
    const [toast, setToast] = useState(null);
    const [activeTab, setActiveTab] = useState('workers');
    const [expandedVehicle, setExpandedVehicle] = useState(null);
    const fileInputRefs = useRef({});

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    // Handle real file/camera selection
    const handleFileSelect = (workerId, event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { showToast('⚠️ Please select an image file'); return; }
        if (file.size > 10 * 1024 * 1024) { showToast('⚠️ File too large. Max 10MB.'); return; }

        const previewUrl = URL.createObjectURL(file);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setWorkers(prev => prev.map(w => w.id === workerId ? {
                        ...w, photoUploaded: true, photoPreview: previewUrl, photoFile: file,
                        lastPhoto: new Date().toLocaleString('en-IN'),
                        lat: position.coords.latitude, lng: position.coords.longitude, verified: false,
                    } : w));
                    showToast(`✅ Photo "${file.name}" uploaded with GPS! Ensure vehicle is visible.`);
                },
                () => {
                    setWorkers(prev => prev.map(w => w.id === workerId ? {
                        ...w, photoUploaded: true, photoPreview: previewUrl, photoFile: file,
                        lastPhoto: new Date().toLocaleString('en-IN'), verified: false,
                    } : w));
                    showToast(`✅ Photo uploaded! (GPS unavailable)`);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };

    const triggerFileInput = (workerId) => {
        if (userRole !== 'worker') { showToast('⚠️ Only workers can upload photos!'); return; }
        fileInputRefs.current[workerId]?.click();
    };

    const handleVerify = (workerId) => {
        if (userRole !== 'admin') { showToast('⚠️ Only admins can verify photos!'); return; }
        setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, verified: true } : w));
        showToast('✅ Photo verified successfully!');
    };

    const missingUploads = workers.filter(w => !w.photoUploaded && w.status === 'active');
    const uploadedCount = workers.filter(w => w.photoUploaded).length;
    const verifiedCount = workers.filter(w => w.verified).length;

    const getTaskStatusStyle = (status) => {
        if (status === 'completed') return { bg: 'rgba(34,197,94,0.15)', color: '#2a9d8f', label: 'Completed', icon: '✅' };
        if (status === 'in-progress') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'In Progress', icon: '🔄' };
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: 'Pending', icon: '⏳' };
    };

    const getVehicleStatusStyle = (status) => {
        if (status === 'on-route') return { bg: 'rgba(34,197,94,0.15)', color: '#2a9d8f', label: '🟢 On Route', icon: '🚛' };
        if (status === 'parked') return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '🟡 Parked', icon: '🅿️' };
        return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '🔴 Maintenance', icon: '🔧' };
    };

    return (
        <div>
            {/* Tab Switcher */}
            <div style={{
                display: 'flex', gap: 4, marginBottom: 24,
                background: 'var(--bg-card)', borderRadius: 'var(--radius-full)',
                padding: 4, border: '1px solid var(--border)', width: 'fit-content',
            }}>
                {[
                    { key: 'workers', label: '👷 Workers & Photos' },
                    { key: 'vehicles', label: '🚛 Garbage Vehicles' },
                    { key: 'tasks', label: '📋 Task Status' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '10px 20px', borderRadius: 'var(--radius-full)',
                            fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                            background: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                            color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
                            transition: 'all 0.2s', whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ===== VEHICLES TAB ===== */}
            {activeTab === 'vehicles' && (
                <div>
                    {/* Vehicle Stats */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16, marginBottom: 24,
                    }}>
                        <div className="stat-card">
                            <div className="stat-icon blue">🚛</div>
                            <div className="stat-value">{vehiclesData.length}</div>
                            <div className="stat-label">Total Vehicles</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">🟢</div>
                            <div className="stat-value">{vehiclesData.filter(v => v.status === 'on-route').length}</div>
                            <div className="stat-label">On Route</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>🅿️</div>
                            <div className="stat-value">{vehiclesData.filter(v => v.status === 'parked').length}</div>
                            <div className="stat-label">Parked</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon red">🔧</div>
                            <div className="stat-value" style={{ color: 'var(--danger)' }}>
                                {vehiclesData.filter(v => v.status === 'maintenance').length}
                            </div>
                            <div className="stat-label">In Maintenance</div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div style={{
                        background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                        borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 24,
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span style={{ fontSize: 20 }}>🗺️</span>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Vehicle Routes on Map</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                Go to <strong>Dustbin Map</strong> → Toggle <strong>"Show Vehicle Routes"</strong> to see all vehicle collection paths
                            </p>
                        </div>
                    </div>

                    {/* Vehicle Cards */}
                    <div className="section-header">
                        <h3>🚛 Garbage Vehicle Fleet</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
                        {vehiclesData.map(vehicle => {
                            const vstyle = getVehicleStatusStyle(vehicle.status);
                            const stopsCompleted = vehicle.route.filter(r => r.collected).length;
                            const totalStops = vehicle.route.length;
                            const progress = (stopsCompleted / totalStops) * 100;
                            const isExpanded = expandedVehicle === vehicle.id;

                            return (
                                <div key={vehicle.id} style={{
                                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                    transition: 'all 0.2s', position: 'relative',
                                }}>
                                    {/* Color bar */}
                                    <div style={{ height: 4, background: vehicle.color }} />

                                    <div style={{ padding: '20px' }}>
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: 'var(--radius-md)',
                                                    background: `${vehicle.color}22`, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', fontSize: 24,
                                                }}>
                                                    🚛
                                                </div>
                                                <div>
                                                    <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{vehicle.number}</h4>
                                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                                        {vehicle.type} • {vehicle.capacity}
                                                    </p>
                                                </div>
                                            </div>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                                fontSize: 11, fontWeight: 600, background: vstyle.bg, color: vstyle.color,
                                            }}>
                                                {vstyle.label}
                                            </span>
                                        </div>

                                        {/* Details Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: 16 }}>
                                            <div>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Driver</p>
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>{vehicle.driver}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Zone</p>
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>{vehicle.zone}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Phone</p>
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>📞 {vehicle.driverPhone}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Last Service</p>
                                                <p style={{ fontSize: 13, fontWeight: 600, margin: '2px 0 0' }}>🔧 {vehicle.lastService}</p>
                                            </div>
                                        </div>

                                        {/* Fuel Level */}
                                        <div style={{ marginBottom: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⛽ Fuel Level</span>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 600,
                                                    color: vehicle.fuelLevel < 30 ? 'var(--danger)' : vehicle.fuelLevel < 60 ? 'var(--warning)' : 'var(--success)',
                                                }}>
                                                    {vehicle.fuelLevel}%
                                                </span>
                                            </div>
                                            <div style={{
                                                height: 6, background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    height: '100%', width: `${vehicle.fuelLevel}%`, borderRadius: 'var(--radius-full)',
                                                    background: vehicle.fuelLevel < 30 ? 'var(--danger)' : vehicle.fuelLevel < 60 ? 'var(--warning)' : 'var(--success)',
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>
                                        </div>

                                        {/* Route Progress */}
                                        <div style={{ marginBottom: 12 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 Collection Progress</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-light)' }}>
                                                    {stopsCompleted}/{totalStops} stops
                                                </span>
                                            </div>
                                            <div style={{
                                                height: 6, background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    height: '100%', width: `${progress}%`, borderRadius: 'var(--radius-full)',
                                                    background: `linear-gradient(90deg, ${vehicle.color}, ${vehicle.color}cc)`,
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>
                                        </div>

                                        {/* Toggle Route Details */}
                                        <button
                                            onClick={() => setExpandedVehicle(isExpanded ? null : vehicle.id)}
                                            style={{
                                                width: '100%', padding: '10px', background: 'var(--bg-surface)',
                                                border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', gap: 6, transition: 'all 0.15s',
                                            }}
                                        >
                                            {isExpanded ? '▲ Hide Route' : '▼ Show Route Details'}
                                        </button>

                                        {/* Expanded Route */}
                                        {isExpanded && (
                                            <div style={{ marginTop: 14, animation: 'fadeIn 0.3s ease' }}>
                                                <div style={{
                                                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                                                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
                                                }}>
                                                    🗺️ Collection Route
                                                </div>
                                                <div style={{ position: 'relative' }}>
                                                    <div style={{
                                                        position: 'absolute', left: 14, top: 12, bottom: 12,
                                                        width: 2, background: `${vehicle.color}44`,
                                                    }} />
                                                    {vehicle.route.map((stop, idx) => (
                                                        <div key={idx} style={{
                                                            display: 'flex', alignItems: 'center', gap: 12,
                                                            marginBottom: idx < vehicle.route.length - 1 ? 12 : 0,
                                                            position: 'relative',
                                                        }}>
                                                            <div style={{
                                                                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                                                                background: stop.collected ? vehicle.color : 'var(--bg-card)',
                                                                border: `2px solid ${vehicle.color}`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: 12, color: stop.collected ? 'white' : vehicle.color,
                                                                zIndex: 1,
                                                            }}>
                                                                {stop.collected ? '✓' : stop.order}
                                                            </div>
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                    <span style={{ fontSize: 13, fontWeight: stop.collected ? 400 : 600 }}>{stop.area}</span>
                                                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{stop.dustbinId}</span>
                                                                </div>
                                                            </div>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                                fontSize: 10, fontWeight: 600,
                                                                background: stop.collected ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.1)',
                                                                color: stop.collected ? '#2a9d8f' : 'var(--text-muted)',
                                                            }}>
                                                                {stop.collected ? '✅ Done' : '⏳ Pending'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ===== TASKS TAB ===== */}
            {activeTab === 'tasks' && (
                <div>
                    <div className="section-header">
                        <h3>📋 Worker Task & Complaint Status</h3>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {workerTasks.filter(t => t.status === 'completed').length}/{workerTasks.length} tasks completed
                        </span>
                    </div>

                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 16, marginBottom: 24,
                    }}>
                        {[
                            { value: workerTasks.length, label: 'Total Tasks' },
                            { value: workerTasks.filter(t => t.status === 'pending').length, label: 'Pending', color: 'var(--danger)' },
                            { value: workerTasks.filter(t => t.status === 'in-progress').length, label: 'In Progress', color: 'var(--warning)' },
                            { value: workerTasks.filter(t => t.status === 'completed').length, label: 'Completed', color: 'var(--success)' },
                        ].map((s, i) => (
                            <div key={i} style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', padding: '20px', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="table-container">
                        <div className="table-header"><h3>🗂️ All Assigned Tasks</h3></div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Worker</th><th>Area</th><th>Task / Complaint</th>
                                        <th>Dustbin</th><th>Status</th><th>Assigned</th><th>Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workerTasks.map(task => {
                                        const worker = workers.find(w => w.id === task.workerId);
                                        const style = getTaskStatusStyle(task.status);
                                        return (
                                            <tr key={task.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{
                                                            width: 32, height: 32, borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: 12, color: 'white', fontWeight: 700, flexShrink: 0,
                                                        }}>
                                                            {worker?.name?.split(' ').map(n => n[0]).join('') || '?'}
                                                        </div>
                                                        <span style={{ fontWeight: 600, fontSize: 13 }}>{worker?.name || 'Unknown'}</span>
                                                    </div>
                                                </td>
                                                <td>{task.area}</td>
                                                <td style={{ fontSize: 13 }}>{task.task}</td>
                                                <td style={{ fontWeight: 600, color: 'var(--accent)', fontSize: 13 }}>{task.dustbinId}</td>
                                                <td>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                                        padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                                        fontSize: 12, fontWeight: 600, background: style.bg, color: style.color,
                                                    }}>
                                                        {style.icon} {style.label}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{task.assignedAt}</td>
                                                <td style={{ fontSize: 12, color: task.completedAt ? 'var(--success)' : 'var(--text-muted)' }}>
                                                    {task.completedAt || '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== WORKERS TAB ===== */}
            {activeTab === 'workers' && (
                <div>
                    {/* Summary Stats */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16, marginBottom: 28,
                    }}>
                        <div className="stat-card">
                            <div className="stat-icon blue">👷</div>
                            <div className="stat-value">{workers.length}</div>
                            <div className="stat-label">Total Workers</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon green">📸</div>
                            <div className="stat-value">{uploadedCount}/{workers.length}</div>
                            <div className="stat-label">Photos Uploaded Today</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon blue">✓</div>
                            <div className="stat-value">{verifiedCount}</div>
                            <div className="stat-label">Verified by Admin</div>
                        </div>
                        <div className={`stat-card ${missingUploads.length > 0 ? 'danger' : ''}`}>
                            <div className="stat-icon red">⚠️</div>
                            <div className="stat-value" style={{ color: missingUploads.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
                                {missingUploads.length}
                            </div>
                            <div className="stat-label">Missing Uploads</div>
                        </div>
                    </div>

                    {/* Admin Alert */}
                    {userRole === 'admin' && missingUploads.length > 0 && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 'var(--radius-lg)', padding: '20px 24px', marginBottom: 24,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <span style={{ fontSize: 20 }}>🚨</span>
                                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--danger)' }}>
                                    Alert: {missingUploads.length} Worker(s) Haven't Uploaded Today's Photo
                                </h4>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {missingUploads.map(w => (
                                    <div key={w.id} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '8px 14px', background: 'rgba(239,68,68,0.1)',
                                        borderRadius: 'var(--radius-full)', fontSize: 13,
                                    }}>
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)' }}></span>
                                        <span style={{ fontWeight: 600 }}>{w.name}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({w.area})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Worker instructions */}
                    {userRole === 'worker' && (
                        <div style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                            borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 24,
                            display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                            <span style={{ fontSize: 20 }}>📷</span>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Daily Photo Upload Required</p>
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                                    Take a photo after cleaning. <strong style={{ color: 'var(--warning)' }}>⚠️ The garbage vehicle must be visible in the photo</strong> for verification.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="section-header"><h3>{t('workerTitle')}</h3></div>

                    <div className="worker-grid">
                        {workers.map(worker => {
                            // Find assigned vehicle
                            const assignedVehicle = vehiclesData.find(v => v.driver === worker.name);

                            return (
                                <div className="worker-card" key={worker.id}>
                                    <input type="file" accept="image/*" capture="environment"
                                        ref={(el) => { fileInputRefs.current[worker.id] = el; }}
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileSelect(worker.id, e)}
                                    />

                                    <div className="worker-card-header">
                                        <div className="worker-avatar">
                                            {worker.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="worker-info">
                                            <h4>{worker.name}</h4>
                                            <p>{worker.area} • {worker.zone}</p>
                                        </div>
                                        <div className="worker-status">
                                            <span className={`online-dot ${worker.status}`}></span>
                                            <span style={{ color: worker.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>
                                                {worker.status === 'active' ? 'Active' : 'Offline'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Assigned Vehicle Badge */}
                                    {assignedVehicle && (
                                        <div style={{
                                            margin: '0 16px', padding: '8px 14px',
                                            background: `${assignedVehicle.color}15`, border: `1px solid ${assignedVehicle.color}33`,
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
                                        }}>
                                            <span>🚛</span>
                                            <span style={{ fontWeight: 600, color: assignedVehicle.color }}>{assignedVehicle.number}</span>
                                            <span style={{ color: 'var(--text-muted)' }}>•</span>
                                            <span style={{ color: 'var(--text-muted)' }}>{assignedVehicle.type}</span>
                                            <span style={{
                                                marginLeft: 'auto', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                                                fontSize: 10, fontWeight: 600,
                                                background: assignedVehicle.status === 'on-route' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)',
                                                color: assignedVehicle.status === 'on-route' ? '#2a9d8f' : '#f59e0b',
                                            }}>
                                                {assignedVehicle.status === 'on-route' ? '🟢 On Route' : assignedVehicle.status === 'parked' ? '🟡 Parked' : '🔴 Maint.'}
                                            </span>
                                        </div>
                                    )}

                                    <div className="worker-card-body">
                                        {worker.photoUploaded ? (
                                            <div>
                                                <div style={{
                                                    height: 200, borderRadius: 'var(--radius-md)',
                                                    position: 'relative', overflow: 'hidden',
                                                    background: worker.photoPreview ? 'transparent' : 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
                                                }}>
                                                    {worker.photoPreview ? (
                                                        <img src={worker.photoPreview} alt={`Cleaning photo by ${worker.name}`}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>📸</div>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute', top: 10, right: 10,
                                                        background: worker.verified ? 'var(--success)' : 'var(--warning)',
                                                        color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                        fontSize: 11, fontWeight: 600, backdropFilter: 'blur(4px)',
                                                    }}>
                                                        {worker.verified ? '✓ Verified' : '⏳ Pending Verification'}
                                                    </div>
                                                    {worker.photoFile && (
                                                        <div style={{
                                                            position: 'absolute', bottom: 10, left: 10,
                                                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                                                            color: 'white', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                                            fontSize: 10, maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        }}>📄 {worker.photoFile.name}</div>
                                                    )}
                                                    {userRole === 'admin' && !worker.verified && (
                                                        <button onClick={() => handleVerify(worker.id)} style={{
                                                            position: 'absolute', bottom: 10, right: 10, background: 'var(--primary)', color: 'white',
                                                            padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                                                            cursor: 'pointer', border: 'none', boxShadow: 'var(--shadow-md)',
                                                        }}>✓ Verify Photo</button>
                                                    )}
                                                    {userRole === 'worker' && (
                                                        <button onClick={() => triggerFileInput(worker.id)} style={{
                                                            position: 'absolute', bottom: 10, right: worker.verified ? 10 : 'auto', left: worker.verified ? 'auto' : 10,
                                                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: 'white',
                                                            padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600,
                                                            cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)',
                                                        }}>🔄 Re-upload</button>
                                                    )}
                                                </div>
                                                <div className="geo-tag"><span className="geo-icon">📍</span><span>{t('location')}: {worker.lat?.toFixed(4) || 'N/A'}, {worker.lng?.toFixed(4) || 'N/A'}</span></div>
                                                <div className="geo-tag" style={{ marginTop: 8 }}><span className="geo-icon">🕐</span><span>{t('lastUpdate')}: {worker.lastPhoto}</span></div>
                                                {worker.photoFile && (
                                                    <div className="geo-tag" style={{ marginTop: 8 }}><span className="geo-icon">📄</span><span>File: {worker.photoFile.name} ({(worker.photoFile.size / 1024).toFixed(0)} KB)</span></div>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="worker-photo-upload"
                                                    onClick={() => userRole === 'worker' && triggerFileInput(worker.id)}
                                                    style={{ cursor: userRole === 'worker' ? 'pointer' : 'default', opacity: userRole === 'worker' ? 1 : 0.7, minHeight: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                                                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t('uploadPhoto')}</p>
                                                    <p style={{ fontSize: 12, marginTop: 6, color: 'var(--text-muted)', textAlign: 'center' }}>
                                                        {userRole === 'worker' ? '📱 Tap to open camera or select from files' : t('uploadHint')}
                                                    </p>
                                                    {userRole === 'worker' && (
                                                        <>
                                                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                                                <span style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 11, color: 'var(--primary-light)', fontWeight: 600 }}>📷 Camera</span>
                                                                <span style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>📁 Files</span>
                                                            </div>
                                                            <p style={{ fontSize: 11, color: 'var(--warning)', marginTop: 10, fontWeight: 600, textAlign: 'center' }}>
                                                                ⚠️ Vehicle must be visible in photo!
                                                            </p>
                                                        </>
                                                    )}
                                                    <p className="required" style={{ marginTop: 6 }}>{t('mandatory')}</p>
                                                    {userRole === 'admin' && (
                                                        <p style={{ fontSize: 11, color: 'var(--warning)', marginTop: 10, padding: '6px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius-sm)' }}>⚠️ Awaiting worker upload</p>
                                                    )}
                                                    {userRole === 'citizen' && (
                                                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>🔒 Photo uploads restricted to workers only</p>
                                                    )}
                                                </div>
                                                {userRole === 'admin' && worker.status === 'active' && (
                                                    <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        🚨 No work photo uploaded today
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {toast && <div className="toast">{toast}</div>}
        </div>
    );
}
