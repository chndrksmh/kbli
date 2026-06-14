import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RefreshCcw, CheckCircle2, XCircle, MapPin, Briefcase, Banknote, AlertTriangle, Layers, Building, Sparkles, Search } from 'lucide-react';
import SearchableSelect from '../SearchableSelect';
import { apiFetch } from '../../lib/api';
import { useTranslation } from 'react-i18next';

/* ── Helpers ── */
function formatInvestmentCriteria(min, max) {
    if (min !== null && max !== null) {
        if (min === max) return formatRupiah(min);
        return `${formatRupiah(min)} — ${formatRupiah(max)}`;
    }
    if (min !== null) return `Minimal ${formatRupiah(min)}`;
    if (max !== null) return `Maksimal ${formatRupiah(max)}`;
    return '';
}
function formatRupiah(val) {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '';
    if (num >= 1e12) return `Rp ${(num / 1e12).toFixed(1)} Triliun`;
    if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(0)} Miliar`;
    if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(0)} Juta`;
    return `Rp ${num.toLocaleString('id-ID')}`;
}

/* ── Sub-components ── */
function FieldLabel({ children }) {
    return (
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>
            {children}
        </div>
    );
}

function InfoCard({ label, value, icon }) {
    return (
        <div style={{ display: 'flex', gap: 14 }}>
            <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: '#f0fdf4', border: '1.5px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1f2937', lineHeight: 1.55 }}>{value}</div>
            </div>
        </div>
    );
}

/* ── Main Component ── */
export default function TaxAllowanceSimulator() {
    const { t } = useTranslation();
    const [provinsi, setProvinsi] = useState('');
    const [bidangUsaha, setBidangUsaha] = useState('');
    const [cakupanBidangUsaha, setCakupanBidangUsaha] = useState('');
    const [kategoriInvestasi, setKategoriInvestasi] = useState('Baru');
    const [nilaiInvestasi, setNilaiInvestasi] = useState('');
    const [result, setResult] = useState(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [availableBidangUsaha, setAvailableBidangUsaha] = useState([]);
    const [availableCakupan, setAvailableCakupan] = useState([]);
    const [investmentCriteria, setInvestmentCriteria] = useState(null);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        let ignore = false;
        const params = new URLSearchParams();
        if (provinsi) params.set('provinsi', provinsi);
        if (bidangUsaha) params.set('bidangUsaha', bidangUsaha);
        if (cakupanBidangUsaha) params.set('cakupanBidangUsaha', cakupanBidangUsaha);
        params.set('kategoriInvestasi', kategoriInvestasi);
        if (!provinsi) { setAvailableBidangUsaha([]); setAvailableCakupan([]); setInvestmentCriteria(null); }
        else if (!bidangUsaha) { setAvailableCakupan([]); setInvestmentCriteria(null); }
        else if (!cakupanBidangUsaha) { setInvestmentCriteria(null); }
        apiFetch(`/api/tax-allowance/options?${params.toString()}`, { auth: false })
            .then(data => { if (ignore) return; setProvinces(data.provinces); setAvailableBidangUsaha(data.bidangUsaha); setAvailableCakupan(data.cakupanBidangUsaha); setInvestmentCriteria(data.investmentCriteria); setLoadError(''); })
            .catch(error => { if (ignore) return; setInvestmentCriteria(null); setLoadError(error.message); });
        return () => { ignore = true; };
    }, [provinsi, bidangUsaha, cakupanBidangUsaha, kategoriInvestasi]);

    const handleSimulate = async () => {
        if (!provinsi || !bidangUsaha || !cakupanBidangUsaha || !nilaiInvestasi) return;
        const investmentValue = parseFloat(nilaiInvestasi);
        if (isNaN(investmentValue)) return;
        setIsCalculating(true); setResult(null);
        try {
            const data = await apiFetch('/api/tax-allowance/simulate', { method: 'POST', auth: false, body: JSON.stringify({ provinsi, bidangUsaha, cakupanBidangUsaha, kategoriInvestasi, nilaiInvestasi: investmentValue }) });
            setResult(data);
        } catch { setResult({ status: 'error', provinsi, kawasanIndustri: [], kawasanIndustriDipilih: '', bidangUsaha, cakupanBidangUsaha, kategoriInvestasi, nilaiMinInvestasi: 0, summary: '', syarat: [], taxAllowance: 'Tidak tersedia', insentifTambahan: [] }); }
        setIsCalculating(false);
    };

    const handleReset = () => { setProvinsi(''); setBidangUsaha(''); setCakupanBidangUsaha(''); setKategoriInvestasi('Baru'); setNilaiInvestasi(''); setResult(null); setInvestmentCriteria(null); };

    const handleDownload = () => {
        if (!result) return;
        const content = `${t("tax.laporanJudulAllowance")}\n\n${t("tax.statusLaporan")}: ${result.status === 'success' ? t("tax.statusSesuai") : t("tax.statusBelumMemenuhi")}\n${t("tax.provinsiLaporan")}: ${result.provinsi}\n${t("tax.bidangUsahaLaporan")}: ${result.bidangUsaha}\n${t("tax.cakupanLaporan")}: ${result.cakupanBidangUsaha}\n${t("tax.kategoriLaporan")}: ${result.kategoriInvestasi}\n${t("tax.nilaiInvestasiLaporan")}: Rp ${parseFloat(nilaiInvestasi).toLocaleString('id-ID')}\n\nTAX ALLOWANCE:\n${result.taxAllowance}\n\n${t("tax.ringkasan").toUpperCase()}:\n${result.summary}\n\n${t("tax.syaratLaporan")}:\n${result.syarat.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n---\n${t("tax.simulasiIndikatif")}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `simulasi-tax-allowance-${Date.now()}.txt`; a.click();
        URL.revokeObjectURL(url);
    };

    const canSimulate = !isCalculating && provinsi && bidangUsaha && cakupanBidangUsaha && nilaiInvestasi;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

            {/* ── LEFT: Form ── */}
            <div>
                <div style={{ marginBottom: 28 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{t("tax.parameterEstimasi")}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{t("tax.estimasiAllowance")}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                    {/* Provinsi */}
                    <div>
                        <FieldLabel><MapPin size={10} style={{ marginRight: 4 }} />{t("tax.wilayahProvinsi")}</FieldLabel>
                        {loadError && <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>{loadError}</div>}
                        <SearchableSelect value={provinsi} options={provinces} onChange={(v) => { setProvinsi(v); setBidangUsaha(''); setCakupanBidangUsaha(''); setAvailableBidangUsaha([]); setAvailableCakupan([]); setInvestmentCriteria(null); setResult(null); }} placeholder={t("tax.pilihProvinsi")} searchPlaceholder={t("tax.cariProvinsi")} />
                    </div>

                    {/* Bidang Usaha */}
                    <div>
                        <FieldLabel><Briefcase size={10} style={{ marginRight: 4 }} />{t("tax.bidangUsaha")}</FieldLabel>
                        <SearchableSelect value={bidangUsaha} options={availableBidangUsaha} onChange={(v) => { setBidangUsaha(v); setCakupanBidangUsaha(''); setAvailableCakupan([]); setInvestmentCriteria(null); setResult(null); }} placeholder={t("tax.pilihBidangUsaha")} disabled={!provinsi} searchPlaceholder={t("tax.cariBidangUsaha")} />
                    </div>

                    {/* Cakupan */}
                    <div>
                        <FieldLabel><Layers size={10} style={{ marginRight: 4 }} />{t("tax.cakupanBidangUsaha")}</FieldLabel>
                        <SearchableSelect value={cakupanBidangUsaha} options={availableCakupan} onChange={(v) => { setCakupanBidangUsaha(v); setInvestmentCriteria(null); setResult(null); }} placeholder={t("tax.pilihCakupan")} disabled={!bidangUsaha} searchPlaceholder={t("tax.cariCakupan")} />
                    </div>

                    {/* Info box */}
                    <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#64748b', lineHeight: 1.55 }}>
                        💡 {t("tax.kawasanIndustriInfo")}
                    </div>

                    {/* Kategori Investasi */}
                    <div>
                        <FieldLabel>{t("tax.kategoriInvestasi")}</FieldLabel>
                        <div style={{ display: 'flex', gap: 10 }}>
                            {[t("tax.baru"), t("tax.perluasan")].map(kat => (
                                <button key={kat} onClick={() => { setKategoriInvestasi(kat); setInvestmentCriteria(null); setResult(null); }} style={{
                                    flex: 1, padding: '11px 16px', borderRadius: 12, fontFamily: 'inherit',
                                    border: kategoriInvestasi === kat ? '2px solid #10b981' : '2px solid #e5e7eb',
                                    background: kategoriInvestasi === kat ? '#f0fdf4' : '#fff',
                                    color: kategoriInvestasi === kat ? '#065f46' : '#6b7280',
                                    fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                    {kat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nilai Investasi */}
                    <div>
                        <FieldLabel><Banknote size={10} style={{ marginRight: 4 }} />{t("tax.nilaiInvestasiDirencanakan")}</FieldLabel>
                        {investmentCriteria && (
                            <div style={{ fontSize: 12, color: '#065f46', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 12px', marginBottom: 8, fontWeight: 500 }}>
                                {t("tax.kriteriaAcuan")} {formatInvestmentCriteria(investmentCriteria.min, investmentCriteria.max)}
                            </div>
                        )}
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 600, color: '#10b981', pointerEvents: 'none' }}>Rp</span>
                            <input
                                type="text"
                                value={nilaiInvestasi ? parseInt(nilaiInvestasi).toLocaleString('id-ID') : ''}
                                onChange={(e) => { const raw = e.target.value.replace(/\D/g, ''); setNilaiInvestasi(raw); setResult(null); }}
                                placeholder="0"
                                style={{
                                    width: '100%', padding: '13px 100px 13px 46px',
                                    border: '2px solid #e5e7eb', borderRadius: 12,
                                    fontSize: 16, fontWeight: 600, color: '#111827',
                                    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                                    transition: 'border-color 0.2s, box-shadow 0.2s',
                                    background: '#fff',
                                }}
                                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 4px rgba(16,185,129,0.08)'; }}
                                onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                            />
                            {nilaiInvestasi && (
                                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontWeight: 600, color: '#10b981', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '2px 8px' }}>
                                    {formatRupiah(nilaiInvestasi)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <button onClick={handleSimulate} disabled={!canSimulate} style={{
                        flex: 1, padding: '14px 20px', borderRadius: 12, border: 'none', cursor: canSimulate ? 'pointer' : 'not-allowed',
                        background: canSimulate ? 'linear-gradient(135deg,#10b981,#059669)' : '#e5e7eb',
                        color: canSimulate ? '#fff' : '#9ca3af', fontSize: 14, fontWeight: 700,
                        boxShadow: canSimulate ? '0 4px 14px rgba(16,185,129,0.3)' : 'none',
                        transition: 'all 0.2s', fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                        {isCalculating ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                        ) : t("tax.simulasikanInvestasi")}
                    </button>
                    <button onClick={handleReset} title="Reset" style={{
                        padding: '14px 16px', borderRadius: 12, border: '2px solid #e5e7eb',
                        background: '#fff', cursor: 'pointer', color: '#6b7280', transition: 'all 0.2s', fontFamily: 'inherit',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.color = '#374151'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6b7280'; }}
                    >
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            {/* ── RIGHT: Result Panel ── */}
            <div style={{ background: 'linear-gradient(145deg,#f8fafc,#f1f5f9)', borderRadius: 20, border: '1.5px solid #e2e8f0', minHeight: 460, padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>
                <AnimatePresence mode="wait">

                    {!result && !isCalculating && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <Search size={28} color="#10b981" />
                            </div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>{t("tax.siapMenganalisis")}</div>
                            <p style={{ fontSize: 13, color: '#9ca3af', maxWidth: 260, lineHeight: 1.65, margin: 0 }}>{t("tax.lengkapiParameterAllowance")}</p>
                        </motion.div>
                    )}

                    {isCalculating && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} style={{ width: 52, height: 52, border: '3px solid #d1fae5', borderTopColor: '#10b981', borderRadius: '50%', marginBottom: 16 }} />
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#059669', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t("tax.memprosesData")}</div>
                        </motion.div>
                    )}

                    {result?.status === 'error' && (
                        <motion.div key="error" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 14 }}>
                                <XCircle size={22} color="#ef4444" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>{t("tax.dataTidakDitemukan")}</div>
                                    <div style={{ fontSize: 13, color: '#b91c1c', lineHeight: 1.55 }}>{t("tax.kombinasiParameterTidakTersedia")}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {result?.status === 'below_minimum' && (
                        <motion.div key="oor" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: '16px 20px', display: 'flex', gap: 14, marginBottom: 24 }}>
                                <AlertTriangle size={22} color="#d97706" style={{ flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>{t("tax.investasiDibawahMinimum")}</div>
                                    <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.55, marginBottom: 8 }}>{t("tax.kategoriMemerlukanMinimal").replace("Category", "Kategori")} <strong>{result.kategoriInvestasi}</strong>:</div>
                                    <span style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#78350f' }}>
                                        {formatRupiah(result.nilaiMinInvestasi)}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <InfoCard label={t("tax.ringkasanHasil")} value={result.summary} icon={<Sparkles size={16} />} />
                                <InfoCard label={t("tax.potensiTaxAllowance")} value={result.taxAllowance} icon={<Banknote size={16} />} />
                            </div>
                        </motion.div>
                    )}

                    {result?.status === 'success' && (
                        <motion.div key="success" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#d1fae5', border: '1.5px solid #6ee7b7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={18} color="#059669" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#059669' }}>{t("tax.memenuhiSyarat")}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{t("tax.indikasiKelayakanValid")}</div>
                                    </div>
                                </div>
                                <button onClick={handleDownload} style={{
                                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                                    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 999,
                                    fontSize: 12, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#10b981'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                                >
                                    <Download size={12} color="#10b981" />{t("tax.unduhLaporan")}
                                </button>
                            </div>

                            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#059669', marginBottom: 6 }}>{t("tax.tipeFasilitasTaxAllowance")}</div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: '#052e16', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{result.taxAllowance}</div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1.5px solid #e5e7eb' }}>
                                <InfoCard label={t("tax.kawasanIndustri")} value={result.kawasanIndustri.join(', ') || t("tax.tidakTersedia")} icon={<Building size={16} />} />
                                <InfoCard label={t("tax.bidangUsaha")} value={`${result.bidangUsaha} — ${result.cakupanBidangUsaha}`} icon={<Briefcase size={16} />} />
                                <InfoCard label={t("tax.nilaiMinimum")} value={formatRupiah(result.nilaiMinInvestasi)} icon={<Banknote size={16} />} />
                                <InfoCard label={t("tax.ringkasan")} value={result.summary} icon={<Sparkles size={16} />} />
                            </div>

                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {result.insentifTambahan.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }}>{t("tax.insentifTambahan")}</div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {result.insentifTambahan.map((d, i) => (
                                                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                    <Sparkles size={14} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                                                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{d}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {result.syarat.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 10 }}>{t("tax.persyaratanAdministratif")}</div>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {result.syarat.map((s, i) => (
                                                <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f3f4f6', border: '1.5px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#6b7280' }}>{i + 1}</span>
                                                    </div>
                                                    <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55 }}>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
