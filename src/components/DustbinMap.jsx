import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const getMarkerColor = (status) => {
    if (status === 'full') return '#ef4444';
    if (status === 'partial') return '#f59e0b';
    return '#10b981';
};

export default function DustbinMap({ dustbins, onMarkerClick, showUserLocation = true, height = 500, vehicles = [], showRoutes = false }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const routesLayerRef = useRef(null);
    const userMarkerRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedBin, setSelectedBin] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    const { t } = useLanguage();

    // Initialize map
    useEffect(() => {
        if (!window.L || mapInstanceRef.current) return;

        const map = window.L.map(mapRef.current, {
            center: [9.9252, 78.1198],
            zoom: 13,
            zoomControl: false,
            scrollWheelZoom: true,
            attributionControl: false,
        });

        // Dark tile layer for premium look
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd',
        }).addTo(map);

        // Add zoom control in bottom-right
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add attribution in bottom-left
        window.L.control.attribution({ position: 'bottomleft', prefix: '© CartoDB © OSM' }).addTo(map);

        // Create markers and routes layer groups
        markersLayerRef.current = window.L.layerGroup().addTo(map);
        routesLayerRef.current = window.L.layerGroup().addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                markersLayerRef.current = null;
            }
        };
    }, []);

    // Watch user location in real-time
    useEffect(() => {
        if (!showUserLocation || !navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude, accuracy });
            },
            (err) => {
                console.log('Geolocation error:', err.message);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [showUserLocation]);

    // Update user location marker on map
    useEffect(() => {
        if (!mapInstanceRef.current || !userLocation) return;
        const map = mapInstanceRef.current;

        // Remove old user marker
        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }

        // Create pulsing user location marker
        const userIcon = window.L.divIcon({
            className: 'user-location-marker',
            html: `
        <div style="position:relative;width:24px;height:24px;">
          <div style="
            position:absolute;inset:0;
            background:rgba(59,130,246,0.3);
            border-radius:50%;
            animation:user-pulse 2s ease-in-out infinite;
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;
            transform:translate(-50%,-50%);
            width:14px;height:14px;
            background:#3b82f6;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 8px rgba(59,130,246,0.5);
          "></div>
        </div>
      `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
        });

        userMarkerRef.current = window.L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup(`
        <div style="font-family:Inter,sans-serif;text-align:center;padding:4px;">
          <strong style="color:#3b82f6;">📍 Your Location</strong><br>
          <span style="font-size:11px;color:#666;">
            ${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}
          </span>
        </div>
      `);
    }, [userLocation]);

    // Update dustbin markers with real-time pulse effect
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current || !dustbins.length) return;

        const markers = markersLayerRef.current;
        markers.clearLayers();

        dustbins.forEach(bin => {
            const color = getMarkerColor(bin.status);
            const isFull = bin.status === 'full';
            const isPartial = bin.status === 'partial';

            // Create custom div icon for better visuals
            const icon = window.L.divIcon({
                className: 'dustbin-marker',
                html: `
          <div style="position:relative;width:${isFull ? 32 : 24}px;height:${isFull ? 32 : 24}px;">
            ${isFull ? `
              <div style="
                position:absolute;inset:-6px;
                background:${color}33;
                border-radius:50%;
                animation:marker-pulse 1.5s ease-in-out infinite;
              "></div>
              <div style="
                position:absolute;inset:-14px;
                background:${color}15;
                border-radius:50%;
                animation:marker-pulse 1.5s ease-in-out infinite 0.3s;
              "></div>
            ` : ''}
            <div style="
              position:absolute;inset:0;
              background:${color};
              border-radius:50%;
              border:${isFull ? '3px' : '2px'} solid ${isFull ? '#fff' : color + '88'};
              box-shadow:0 2px 8px ${color}66;
              display:flex;align-items:center;justify-content:center;
              font-size:${isFull ? '14px' : '11px'};
              cursor:pointer;
              transition:transform 0.2s;
            ">
              ${isFull ? '⚠️' : isPartial ? '🟡' : '✓'}
            </div>
          </div>
        `,
                iconSize: [isFull ? 32 : 24, isFull ? 32 : 24],
                iconAnchor: [isFull ? 16 : 12, isFull ? 16 : 12],
                popupAnchor: [0, isFull ? -20 : -14],
            });

            const marker = window.L.marker([bin.lat, bin.lng], { icon }).addTo(markers);

            // Calculate distance from user
            let distanceText = '';
            if (userLocation) {
                const dist = getDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
                distanceText = `<p style="margin:6px 0 0;font-size:12px;color:#3b82f6;font-weight:600;">📏 ${dist < 1 ? (dist * 1000).toFixed(0) + ' m' : dist.toFixed(1) + ' km'} from you</p>`;
            }

            const statusLabel = bin.status === 'full' ? '🔴 FULL — Complaint Active' :
                bin.status === 'partial' ? '🟡 Partially Filled' :
                    '🟢 Clean & Empty';

            const statusBg = bin.status === 'full' ? 'rgba(239,68,68,0.1)' :
                bin.status === 'partial' ? 'rgba(245,158,11,0.1)' :
                    'rgba(34,197,94,0.1)';

            marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;min-width:220px;padding:4px;">
          <h4 style="margin:0 0 8px;font-size:15px;font-weight:700;color:#f1f5f9;">
            🗑️ ${bin.area}
          </h4>
          <div style="display:flex;gap:8px;margin-bottom:8px;">
            <span style="padding:3px 10px;background:rgba(148,163,184,0.1);border-radius:12px;font-size:11px;color:#94a3b8;">
              ${bin.id}
            </span>
            <span style="padding:3px 10px;background:rgba(148,163,184,0.1);border-radius:12px;font-size:11px;color:#94a3b8;">
              ${bin.zone}
            </span>
          </div>
          <div style="padding:8px 12px;background:${statusBg};border-radius:8px;margin-bottom:8px;">
            <p style="margin:0;font-size:13px;font-weight:600;">${statusLabel}</p>
          </div>
          <p style="margin:0;font-size:12px;color:#94a3b8;">
            👤 Incharge: <strong style="color:#f1f5f9;">${bin.incharge}</strong>
          </p>
          <p style="margin:4px 0 0;font-size:11px;color:#64748b;">
            📍 ${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}
          </p>
          ${distanceText}
          ${bin.status === 'full' ? `
            <div style="margin-top:10px;padding:8px;background:rgba(239,68,68,0.1);border-radius:6px;border-left:3px solid #ef4444;">
              <p style="margin:0;font-size:11px;color:#ef4444;font-weight:600;">
                ⚡ Live: This dustbin needs immediate attention
              </p>
            </div>
          ` : ''}
        </div>
      `, {
                className: 'custom-popup',
                maxWidth: 280,
            });

            marker.on('click', () => {
                setSelectedBin(bin);
                if (onMarkerClick) onMarkerClick(bin);
            });
        });
    }, [dustbins, userLocation, onMarkerClick]);

    // Draw vehicle routes on map
    useEffect(() => {
        if (!mapInstanceRef.current || !routesLayerRef.current) return;
        const routesLayer = routesLayerRef.current;
        routesLayer.clearLayers();

        if (!showRoutes || !vehicles.length) return;

        vehicles.forEach(vehicle => {
            if (vehicle.status === 'maintenance') return;

            const routePoints = vehicle.route.map(stop => [stop.lat, stop.lng]);
            if (routePoints.length < 2) return;

            // Draw route polyline
            const polyline = window.L.polyline(routePoints, {
                color: vehicle.color,
                weight: 4,
                opacity: 0.7,
                dashArray: '10, 8',
                className: 'vehicle-route',
            }).addTo(routesLayer);

            // Add stop numbers along route
            vehicle.route.forEach(stop => {
                const stopIcon = window.L.divIcon({
                    className: 'route-stop',
                    html: `
                        <div style="
                            width:22px;height:22px;border-radius:50%;
                            background:${stop.collected ? vehicle.color : '#1e293b'};
                            border:2px solid ${vehicle.color};
                            display:flex;align-items:center;justify-content:center;
                            font-size:10px;font-weight:700;
                            color:${stop.collected ? 'white' : vehicle.color};
                            box-shadow:0 2px 6px rgba(0,0,0,0.3);
                        ">${stop.collected ? '✓' : stop.order}</div>
                    `,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                });

                window.L.marker([stop.lat, stop.lng], { icon: stopIcon })
                    .addTo(routesLayer)
                    .bindPopup(`
                        <div style="font-family:Inter,sans-serif;padding:4px;min-width:180px;">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                                <span style="font-size:16px">🚛</span>
                                <strong style="color:#f1f5f9;font-size:13px">${vehicle.number}</strong>
                            </div>
                            <p style="margin:0;font-size:12px;color:#94a3b8">Stop #${stop.order}: <strong style="color:#f1f5f9">${stop.area}</strong></p>
                            <p style="margin:4px 0 0;font-size:11px;color:#64748b">${stop.dustbinId}</p>
                            <div style="margin-top:6px;padding:4px 8px;border-radius:6px;font-size:11px;font-weight:600;
                                background:${stop.collected ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'};
                                color:${stop.collected ? '#22c55e' : '#f59e0b'}">
                                ${stop.collected ? '✅ Collected' : '⏳ Pending Collection'}
                            </div>
                        </div>
                    `, { className: 'custom-popup', maxWidth: 240 });
            });

            // Add truck marker at current position
            const truckIcon = window.L.divIcon({
                className: 'truck-marker',
                html: `
                    <div style="
                        width:36px;height:36px;border-radius:50%;
                        background:${vehicle.color};border:3px solid white;
                        display:flex;align-items:center;justify-content:center;
                        font-size:18px;box-shadow:0 4px 12px ${vehicle.color}66;
                        animation:user-pulse 2s ease-in-out infinite;
                    ">🚛</div>
                `,
                iconSize: [36, 36],
                iconAnchor: [18, 18],
            });

            window.L.marker([vehicle.currentLat, vehicle.currentLng], { icon: truckIcon })
                .addTo(routesLayer)
                .bindPopup(`
                    <div style="font-family:Inter,sans-serif;padding:4px;min-width:200px;">
                        <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#f1f5f9">🚛 ${vehicle.number}</h4>
                        <p style="margin:0;font-size:12px;color:#94a3b8">Driver: <strong style="color:#f1f5f9">${vehicle.driver}</strong></p>
                        <p style="margin:4px 0;font-size:12px;color:#94a3b8">${vehicle.type} • ${vehicle.capacity}</p>
                        <p style="margin:4px 0;font-size:12px;color:#94a3b8">${vehicle.zone} • ⛽ ${vehicle.fuelLevel}%</p>
                        <div style="margin-top:8px;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;
                            background:${vehicle.status === 'on-route' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'};
                            color:${vehicle.status === 'on-route' ? '#22c55e' : '#f59e0b'}">
                            ${vehicle.status === 'on-route' ? '🟢 On Route' : '🟡 Parked'}
                            — ${vehicle.route.filter(r => r.collected).length}/${vehicle.route.length} collected
                        </div>
                    </div>
                `, { className: 'custom-popup', maxWidth: 260 });
        });
    }, [vehicles, showRoutes]);

    // Fly to user location
    const flyToUser = () => {
        if (!mapInstanceRef.current) return;
        setIsLocating(true);

        if (userLocation) {
            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 1.5 });
            setIsLocating(false);
        } else {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    mapInstanceRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
                    setIsLocating(false);
                },
                () => setIsLocating(false),
                { enableHighAccuracy: true }
            );
        }
    };

    // Fly to specific dustbin
    const flyToBin = (bin) => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.flyTo([bin.lat, bin.lng], 17, { duration: 1 });
        setSelectedBin(bin);
    };

    // Find nearest dustbin
    const findNearest = () => {
        if (!userLocation || !dustbins.length) {
            flyToUser();
            return;
        }

        let nearest = dustbins[0];
        let minDist = Infinity;
        dustbins.forEach(bin => {
            const dist = getDistance(userLocation.lat, userLocation.lng, bin.lat, bin.lng);
            if (dist < minDist) {
                minDist = dist;
                nearest = bin;
            }
        });

        flyToBin(nearest);
    };

    return (
        <div className="map-container">
            <div className="map-header">
                <h3>🗺️ {t('mapTitle')}</h3>
                <div className="map-legend">
                    <div className="legend-item">
                        <div className="legend-dot green"></div>
                        <span>{t('mapLegendClean')}</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot yellow"></div>
                        <span>{t('mapLegendPartial')}</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-dot red"></div>
                        <span>{t('mapLegendFull')}</span>
                    </div>
                    {userLocation && (
                        <div className="legend-item">
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px rgba(59,130,246,0.5)' }}></div>
                            <span>You</span>
                        </div>
                    )}
                    {showRoutes && (
                        <div className="legend-item">
                            <div style={{ width: 14, height: 3, background: 'var(--primary)', borderRadius: 2 }}></div>
                            <span>🚛 Routes</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="map-wrapper" style={{ height, position: 'relative' }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%' }}></div>

                {/* Map Control Buttons */}
                <div style={{
                    position: 'absolute', top: 12, right: 12, zIndex: 1000,
                    display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    {/* Locate Me Button */}
                    <button
                        onClick={flyToUser}
                        style={{
                            width: 42, height: 42, borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: userLocation ? '#3b82f6' : 'var(--text-secondary)',
                            fontSize: 18, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)',
                            transition: 'all 0.2s',
                        }}
                        title="My Location"
                    >
                        {isLocating ? '⏳' : '📍'}
                    </button>

                    {/* Find Nearest Dustbin */}
                    <button
                        onClick={findNearest}
                        style={{
                            width: 42, height: 42, borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: 'var(--primary-light)', fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)', transition: 'all 0.2s',
                        }}
                        title="Find Nearest Dustbin"
                    >
                        🎯
                    </button>

                    {/* Reset View */}
                    <button
                        onClick={() => mapInstanceRef.current?.flyTo([9.9252, 78.1198], 13, { duration: 1 })}
                        style={{
                            width: 42, height: 42, borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: 'var(--text-secondary)', fontSize: 18, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'var(--shadow-md)', transition: 'all 0.2s',
                        }}
                        title="Reset View"
                    >
                        🏠
                    </button>
                </div>

                {/* Real-time indicator */}
                <div style={{
                    position: 'absolute', top: 12, left: 12, zIndex: 1000,
                    padding: '6px 14px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)',
                    borderRadius: 'var(--radius-full)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 11,
                }}>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                        animation: 'marker-pulse 2s infinite',
                    }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Live Map</span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)' }}>{dustbins.length} bins</span>
                </div>

                {/* Selected Bin Info Card */}
                {selectedBin && (
                    <div style={{
                        position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 1000,
                        padding: '16px 20px', background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(12px)',
                        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: 16,
                        animation: 'fadeIn 0.3s ease',
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 'var(--radius-md)',
                            background: `${getMarkerColor(selectedBin.status)}22`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, flexShrink: 0,
                        }}>
                            🗑️
                        </div>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{selectedBin.area}</h4>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0' }}>
                                {selectedBin.id} • {selectedBin.zone} • {selectedBin.incharge}
                            </p>
                            {userLocation && (
                                <p style={{ fontSize: 11, color: '#3b82f6' }}>
                                    📏 {formatDistance(getDistance(userLocation.lat, userLocation.lng, selectedBin.lat, selectedBin.lng))}
                                </p>
                            )}
                        </div>
                        <span style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-full)',
                            fontSize: 12, fontWeight: 600,
                            background: `${getMarkerColor(selectedBin.status)}22`,
                            color: getMarkerColor(selectedBin.status),
                        }}>
                            {selectedBin.status === 'full' ? '🔴 Full' : selectedBin.status === 'partial' ? '🟡 Partial' : '🟢 Clean'}
                        </span>
                        <button
                            onClick={() => setSelectedBin(null)}
                            style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                fontSize: 16, cursor: 'pointer',
                            }}
                        >✕</button>
                    </div>
                )}
            </div>

            {/* CSS Animation Styles */}
            <style>{`
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes user-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(2.5); opacity: 0; }
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background: #1e293b !important;
          border: 1px solid rgba(148,163,184,0.15) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
          color: #f1f5f9 !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #1e293b !important;
          border: 1px solid rgba(148,163,184,0.15) !important;
        }
        .custom-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 18px !important;
        }
        .leaflet-control-zoom a {
          background: #1e293b !important;
          color: #f1f5f9 !important;
          border-color: rgba(148,163,184,0.15) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #273548 !important;
        }
      `}</style>
        </div>
    );
}

// Haversine formula to calculate distance between two coordinates (in km)
function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg) { return deg * Math.PI / 180; }

function formatDistance(km) {
    if (km < 1) return `${(km * 1000).toFixed(0)} m away`;
    return `${km.toFixed(1)} km away`;
}
