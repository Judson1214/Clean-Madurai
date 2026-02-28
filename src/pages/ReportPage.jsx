import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dustbinData } from '../data/appData';

export default function ReportPage() {
    const { t } = useLanguage();
    const [form, setForm] = useState({ area: '', description: '', photo: null });
    const [submitted, setSubmitted] = useState(false);

    const areas = [...new Set(dustbinData.map(d => d.area))];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.area || !form.description) return;
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setForm({ area: '', description: '', photo: null });
        }, 3000);
    };

    return (
        <div>
            <div className="section-header">
                <h3>{t('reportTitle')}</h3>
            </div>

            <div className="form-card">
                {submitted ? (
                    <div className="empty-state">
                        <div className="empty-icon">✅</div>
                        <h4>Complaint Submitted Successfully!</h4>
                        <p>Thank you for reporting. Our team will address this issue shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>
                                {t('selectArea')} <span className="required-star">*</span>
                            </label>
                            <select
                                className="form-input"
                                value={form.area}
                                onChange={(e) => setForm({ ...form, area: e.target.value })}
                                required
                            >
                                <option value="">{t('selectArea')}</option>
                                {areas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                {t('description')} <span className="required-star">*</span>
                            </label>
                            <textarea
                                className="form-input"
                                placeholder={t('descPlaceholder')}
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>📷 Photo (Optional)</label>
                            <div
                                className="worker-photo-upload"
                                onClick={() => document.getElementById('reportPhoto').click()}
                            >
                                <div className="upload-icon">📸</div>
                                <p>{form.photo ? '✅ Photo selected' : 'Click to attach a photo'}</p>
                            </div>
                            <input
                                id="reportPhoto"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            🚨 {t('submit')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
