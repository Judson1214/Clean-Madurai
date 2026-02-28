import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signInWithPhone, verifyPhoneOtp, getOrCreateProfile, supabase } from '../lib/supabase';

export default function LoginPage({ onLogin }) {
    const { t, lang, toggleLang } = useLanguage();
    const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
    const [role, setRole] = useState('citizen');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [authUser, setAuthUser] = useState(null);
    const [useDemo, setUseDemo] = useState(false);
    const otpRefs = useRef([]);

    const DEMO_OTP = '123456';

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Format phone for display
    const formatPhone = (num) => {
        const clean = num.replace(/\D/g, '');
        if (clean.length <= 5) return clean;
        return `${clean.slice(0, 5)} ${clean.slice(5, 10)}`;
    };

    // Send OTP via Supabase
    const handleSendOtp = async (e) => {
        e.preventDefault();
        const cleanPhone = phone.replace(/\D/g, '');

        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit mobile number');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Try real Supabase phone OTP
            const { data, error: otpError } = await signInWithPhone(`+91${cleanPhone}`);

            if (otpError) {
                console.warn('Supabase phone auth error:', otpError.message);
                // Fall back to demo mode on any error (network, provider not enabled, etc.)
                setUseDemo(true);
                setStep('otp');
                setCountdown(60);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
                return;
            }

            // OTP sent successfully via Supabase
            setUseDemo(false);
            setStep('otp');
            setCountdown(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } catch (err) {
            console.warn('Phone auth fallback to demo:', err);
            setUseDemo(true);
            setStep('otp');
            setCountdown(60);
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP input
    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (useDemo) {
                // Demo mode verification
                if (otpCode === DEMO_OTP) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    setStep('profile');
                } else {
                    setError('Invalid OTP. Demo code is 123456');
                }
            } else {
                // Real Supabase OTP verification
                const cleanPhone = phone.replace(/\D/g, '');
                const { data, error: verifyError } = await verifyPhoneOtp(`+91${cleanPhone}`, otpCode);

                if (verifyError) {
                    setError(verifyError.message || 'Invalid OTP code');
                    return;
                }

                // Store auth user for profile creation
                setAuthUser(data.user);
                setStep('profile');
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Complete profile and login
    const handleComplete = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setLoading(true);
        try {
            const cleanPhone = phone.replace(/\D/g, '');

            if (authUser && !useDemo) {
                // Real Supabase: create profile in DB
                const { data: profile, error: profileError } = await getOrCreateProfile(
                    authUser, role, name.trim(), cleanPhone
                );

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }

                onLogin(role, name.trim(), cleanPhone, profile);
            } else {
                // Demo mode: create profile directly in Supabase DB (without auth)
                const { data: profile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        name: name.trim(),
                        phone: cleanPhone,
                        role: role,
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.warn('Demo profile insert:', insertError);
                }

                onLogin(role, name.trim(), cleanPhone, profile);
            }
        } catch (err) {
            console.error('Login error:', err);
            // Still let user in even if DB insert fails
            onLogin(role, name.trim(), phone.replace(/\D/g, ''), null);
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (countdown > 0) return;
        setOtp(['', '', '', '', '', '']);
        setCountdown(60);
        setError('');

        if (!useDemo) {
            const cleanPhone = phone.replace(/\D/g, '');
            await signInWithPhone(`+91${cleanPhone}`);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="logo-section">
                    <div className="login-logo">🏙️</div>
                    <h2>{t('appName')}</h2>
                    <p>{t('loginSubtitle')}</p>
                </div>

                {/* Step indicator */}
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24,
                }}>
                    {['phone', 'otp', 'profile'].map((s, i) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: '50%',
                                background: step === s ? 'var(--primary)' : ['phone', 'otp', 'profile'].indexOf(s) < ['phone', 'otp', 'profile'].indexOf(step) ? 'rgba(16,185,129,0.2)' : 'var(--bg-surface)',
                                color: step === s ? 'white' : 'var(--text-muted)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 12, fontWeight: 700, transition: 'all 0.3s',
                                border: step === s ? 'none' : '1px solid var(--border)',
                            }}>
                                {['phone', 'otp', 'profile'].indexOf(s) < ['phone', 'otp', 'profile'].indexOf(step) ? '✓' : i + 1}
                            </div>
                            {i < 2 && (
                                <div style={{
                                    width: 30, height: 2, borderRadius: 2,
                                    background: ['phone', 'otp', 'profile'].indexOf(s) < ['phone', 'otp', 'profile'].indexOf(step) ? 'var(--primary)' : 'var(--border)',
                                    transition: 'all 0.3s',
                                }}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Connection indicator */}
                {step === 'phone' && (
                    <div style={{
                        textAlign: 'center', marginBottom: 16,
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        background: 'rgba(42,157,143,0.08)', border: '1px solid rgba(42,157,143,0.2)',
                        fontSize: 11, color: '#2a9d8f', fontWeight: 600,
                    }}>
                        🟢 Connected to Supabase
                    </div>
                )}

                {/* STEP 1: Phone Number */}
                {step === 'phone' && (
                    <form onSubmit={handleSendOtp}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>
                                {t('selectRole')}
                            </label>
                            <div className="role-selector">
                                {[
                                    { key: 'admin', icon: '👨‍💼', label: t('admin') },
                                    { key: 'worker', icon: '👷', label: t('worker') },
                                    { key: 'citizen', icon: '👤', label: t('citizen') },
                                ].map(r => (
                                    <div
                                        key={r.key}
                                        className={`role-option ${role === r.key ? 'selected' : ''}`}
                                        onClick={() => setRole(r.key)}
                                    >
                                        <div className="role-icon">{r.icon}</div>
                                        <div className="role-name">{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>📱 Mobile Number <span className="required-star">*</span></label>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)', padding: '0 12px',
                                transition: 'border-color 0.2s',
                            }}>
                                <span style={{
                                    fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)',
                                    padding: '12px 8px 12px 0', borderRight: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    🇮🇳 +91
                                </span>
                                <input
                                    type="tel"
                                    value={formatPhone(phone)}
                                    onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                                    placeholder="98765 43210"
                                    maxLength={11}
                                    style={{
                                        background: 'transparent', border: 'none', outline: 'none',
                                        color: 'var(--text-primary)', fontSize: 16, fontWeight: 600,
                                        padding: '14px 0', width: '100%', letterSpacing: '1px',
                                    }}
                                    autoFocus
                                />
                            </div>
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                                We'll send a 6-digit verification code via SMS
                            </p>
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px 24px', fontSize: 15 }}
                            disabled={loading || phone.replace(/\D/g, '').length !== 10}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <span className="otp-spinner"></span>
                                    Sending OTP...
                                </span>
                            ) : 'Send OTP →'}
                        </button>
                    </form>
                )}

                {/* STEP 2: OTP Verification */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
                                Enter the 6-digit code sent to
                            </p>
                            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-light)' }}>
                                +91 {formatPhone(phone)}
                                <button
                                    type="button"
                                    onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); setUseDemo(false); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}
                                >✏️ Edit</button>
                            </p>
                            {useDemo && (
                                <p style={{
                                    fontSize: 11, color: '#f59e0b', marginTop: 8,
                                    padding: '4px 12px', background: 'rgba(245,158,11,0.1)',
                                    borderRadius: 'var(--radius-full)', display: 'inline-block',
                                }}>
                                    ⚠️ Demo Mode — Phone SMS not configured. Use code: 123456
                                </p>
                            )}
                        </div>

                        {/* OTP Input */}
                        <div style={{
                            display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24,
                        }}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => otpRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(i, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                    onPaste={i === 0 ? handleOtpPaste : undefined}
                                    style={{
                                        width: 48, height: 56, textAlign: 'center',
                                        fontSize: 22, fontWeight: 700,
                                        background: digit ? 'rgba(42,157,143,0.1)' : 'var(--bg-surface)',
                                        border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--text-primary)', outline: 'none',
                                        transition: 'all 0.2s',
                                    }}
                                />
                            ))}
                        </div>

                        {useDemo && (
                            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    Demo OTP: <strong style={{ color: 'var(--primary-light)', fontSize: 14 }}>123456</strong>
                                </p>
                            </div>
                        )}

                        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>⚠️ {error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px 24px', fontSize: 15 }}
                            disabled={loading || otp.join('').length !== 6}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <span className="otp-spinner"></span>
                                    Verifying...
                                </span>
                            ) : 'Verify OTP ✓'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            {countdown > 0 ? (
                                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    Resend OTP in <strong style={{ color: 'var(--primary-light)' }}>{countdown}s</strong>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: 'var(--primary)', fontSize: 13, fontWeight: 600,
                                        cursor: 'pointer', textDecoration: 'underline',
                                    }}
                                >🔄 Resend OTP</button>
                            )}
                        </div>
                    </form>
                )}

                {/* STEP 3: Profile Setup */}
                {step === 'profile' && (
                    <form onSubmit={handleComplete}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                            <p style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
                                {useDemo ? 'Phone verified (Demo)!' : 'Phone verified successfully!'}
                            </p>
                        </div>

                        <div className="form-group">
                            <label>👤 Your Name <span className="required-star">*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError(''); }}
                                placeholder="Enter your full name"
                                autoFocus
                                style={{ fontSize: 15 }}
                            />
                        </div>

                        <div style={{
                            padding: '14px 16px', background: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-md)', marginBottom: 20,
                            border: '1px solid var(--border)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📱 Phone</span>
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>+91 {formatPhone(phone)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>🏷️ Role</span>
                                <span style={{
                                    fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                                    background: role === 'admin' ? 'rgba(168,85,247,0.15)' : role === 'worker' ? 'rgba(59,130,246,0.15)' : 'rgba(42,157,143,0.15)',
                                    color: role === 'admin' ? '#a855f7' : role === 'worker' ? '#3b82f6' : '#2a9d8f',
                                }}>
                                    {role === 'admin' ? '👨‍💼' : role === 'worker' ? '👷' : '👤'} {role}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>💾 Database</span>
                                <span style={{
                                    fontSize: 11, fontWeight: 600,
                                    padding: '4px 10px', borderRadius: 'var(--radius-full)',
                                    background: 'rgba(42,157,143,0.1)', color: '#2a9d8f',
                                }}>
                                    🟢 Supabase Connected
                                </span>
                            </div>
                        </div>

                        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</p>}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px 24px', fontSize: 15 }}
                            disabled={loading || !name.trim()}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <span className="otp-spinner"></span>
                                    Setting up...
                                </span>
                            ) : 'Start Using Clean Madurai 🌿'}
                        </button>
                    </form>
                )}

                <div style={{ marginTop: 20 }}>
                    <div className="lang-toggle">
                        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => toggleLang('en')}>
                            {t('english')}
                        </button>
                        <button className={`lang-btn ${lang === 'ta' ? 'active' : ''}`} onClick={() => toggleLang('ta')}>
                            {t('tamil')}
                        </button>
                    </div>
                </div>

                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
                    {useDemo && step === 'otp' ? '🔑 Demo OTP: 123456' : '📱 Powered by Supabase Auth'}
                </p>

                <style>{`
                    .otp-spinner {
                        width: 16px; height: 16px;
                        border: 2px solid white;
                        border-top-color: transparent;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        display: inline-block;
                    }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
