import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, Percent, Zap, Package } from "lucide-react";
import {
  TaxHolidaySimulator,
  TaxAllowanceSimulator,
  IndonesiaMap,
  TaxSuperDeduction,
  TaxBeaMasuk,
} from "./index";
import { useTranslation } from "react-i18next";

/* ─────────────────────────────────────────────
   Internal pages: 'home' | 'holiday' | 'allowance' | 'supertax' | 'beamasuk'
   ───────────────────────────────────────────── */

const SIMULATORS = [
  {
    id: "holiday",
    icon: TrendingUp,
    label: "Tax Holiday",
    sub: "Pembebasan PPh Badan",
    color: "#10b981",
    bg: "linear-gradient(135deg,#d1fae5,#a7f3d0)",
    border: "#6ee7b7",
    available: true,
  },
  {
    id: "allowance",
    icon: Percent,
    label: "Tax Allowance",
    sub: "Pengurangan Penghasilan Neto",
    color: "#0ea5e9",
    bg: "linear-gradient(135deg,#e0f2fe,#bae6fd)",
    border: "#7dd3fc",
    available: true,
  },
  {
    id: "supertax",
    icon: Zap,
    label: "Super Tax Deduction",
    sub: "Pengurangan Super Pajak",
    color: "#8b5cf6",
    bg: "linear-gradient(135deg,#ede9fe,#ddd6fe)",
    border: "#c4b5fd",
    available: false,
  },
  {
    id: "beamasuk",
    icon: Package,
    label: "Bea Masuk",
    sub: "Fasilitas Kepabeanan",
    color: "#f59e0b",
    bg: "linear-gradient(135deg,#fef3c7,#fde68a)",
    border: "#fcd34d",
    available: false,
  },
];

/* ── Back Button ── */
function BackBtn({ onClick }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "10px 20px",
        fontSize: 14,
        fontWeight: 600,
        color: "#475569",
        cursor: "pointer",
        marginBottom: 28,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#e2e8f0";
        e.currentTarget.style.color = "#1e293b";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f1f5f9";
        e.currentTarget.style.color = "#475569";
      }}
    >
      <ArrowLeft size={16} />
      {t("tax.kembaliKeBeranda")}
    </button>
  );
}

/* ── Simulator Wrapper ── */
function SimulatorPage({ Comp, title, subtitle, onBack }) {
  const { t } = useTranslation();
  return (
    <motion.div
      key="sim"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.35 }}
    >
      <BackBtn onClick={onBack} />
      <div style={{ marginBottom: 32 }}>
        <span
          style={{
            display: "inline-block",
            background: "linear-gradient(90deg,#10b981,#059669)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "4px 14px",
            borderRadius: 999,
            marginBottom: 10,
          }}
        >
          {t("tax.simulasiPajak")}
        </span>
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 6px",
          }}
        >
          {title}
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{subtitle}</p>
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "2rem",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          border: "1px solid #f1f5f9",
        }}
      >
        <Comp />
      </div>
    </motion.div>
  );
}

/* ── Main Landing / Home ── */
function LandingPage({ onSelect }) {
  const { t } = useTranslation();
  const [hoveredProv, setHoveredProv] = useState(null);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 40%,#d1fae5 100%)",
          borderRadius: 24,
          padding: "48px 40px 0",
          marginBottom: 32,
          border: "1px solid #a7f3d0",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(16,185,129,0.12),transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background:
              "radial-gradient(circle,rgba(5,150,105,0.08),transparent)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr",
            gap: 40,
            alignItems: "center",
          }}
        >
          {/* Left: Text */}
          <div style={{ position: "relative", zIndex: 1, paddingBottom: 48 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: 999,
                padding: "6px 14px",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 6px #10b981",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#065f46",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {t("tax.simulatorInsentifKawasan")}{" "}
              </span>
            </div>
            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: 900,
                lineHeight: 1.18,
                color: "#052e16",
                marginBottom: 16,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {t("tax.simulasiInvestasiAnda").split(" ").slice(0, 2).join(" ")}
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#10b981,#059669)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t("tax.simulasiInvestasiAnda").split(" ").slice(2).join(" ")}
              </span>
            </h1>
            <p
              style={{
                color: "#374151",
                fontSize: 14.5,
                lineHeight: 1.75,
                maxWidth: 400,
                marginBottom: 28,
              }}
            >
              {t("tax.platformSimulasi")}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#6b7280",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#fbbf24",
                }}
              />
              {t("tax.simulasiIndikatif")}
            </div>
          </div>

          {/* Right: Map */}
          <div style={{ position: "relative" }}>
            {hoveredProv && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(5,46,22,0.9)",
                  color: "#d1fae5",
                  padding: "6px 16px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  zIndex: 10,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                {hoveredProv}
              </div>
            )}
            <IndonesiaMap
              className=""
              style={{ width: "100%", height: 280 }}
              hoveredProvince={hoveredProv}
              onProvinceHover={setHoveredProv}
            />
          </div>
        </div>
      </div>

      {/* Simulator Cards */}
      <div style={{ marginBottom: 12 }}>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#0f172a",
            marginBottom: 4,
          }}
        >
          {t("tax.pilihModul")}
        </h2>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
          {t("tax.pilihSalahSatu")}
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {SIMULATORS.map((sim) => (
          <SimCard key={sim.id} sim={sim} onClick={() => onSelect(sim.id)} />
        ))}
      </div>
    </motion.div>
  );
}

function SimCard({ sim, onClick }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const Icon = sim.icon;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && sim.available ? sim.bg : "#fff",
        border: `1.5px solid ${hovered && sim.available ? sim.border : "#e2e8f0"}`,
        borderRadius: 18,
        padding: "24px 22px",
        cursor: sim.available ? "pointer" : "pointer",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow:
          hovered && sim.available
            ? `0 8px 24px rgba(0,0,0,0.08)`
            : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {!sim.available && (
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "linear-gradient(90deg,#8b5cf6,#6366f1)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          {t("tax.segeraHadir")}
        </div>
      )}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: sim.bg,
          border: `1.5px solid ${sim.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon size={22} color={sim.color} />
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#0f172a",
          marginBottom: 4,
        }}
      >
        {sim.label}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
        {sim.sub}
      </div>
      {sim.available && (
        <div
          style={{
            marginTop: 18,
            fontSize: 12,
            fontWeight: 600,
            color: sim.color,
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          {t("tax.simulasikanInvestasi")} →
        </div>
      )}
    </motion.div>
  );
}

/* ── Root Component ── */
export default function TaxSimulationPage() {
  const [page, setPage] = useState("home");

  return (
    <div
      style={{
        width: "100%",
        minHeight: "80vh",
        fontFamily: "'Inter', sans-serif",
        padding: "1.5rem",
        background: "linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <AnimatePresence mode="wait">
        {page === "home" && <LandingPage key="home" onSelect={setPage} />}
        {page === "holiday" && (
          <SimulatorPage
            key="holiday"
            Comp={TaxHolidaySimulator}
            title="Simulasi Tax Holiday"
            subtitle="Estimasi kelayakan Pembebasan PPh Badan berdasarkan lokasi, cakupan industri, dan nilai investasi"
            onBack={() => setPage("home")}
          />
        )}
        {page === "allowance" && (
          <SimulatorPage
            key="allowance"
            Comp={TaxAllowanceSimulator}
            title="Simulasi Tax Allowance"
            subtitle="Estimasi kelayakan Pengurangan Penghasilan Neto berdasarkan bidang usaha dan kategori investasi"
            onBack={() => setPage("home")}
          />
        )}
        {page === "supertax" && (
          <SimulatorPage
            key="supertax"
            Comp={TaxSuperDeduction}
            title="Simulator Super Deduction"
            subtitle="Eksplorasi fasilitas pengurangan penghasilan bruto untuk kegiatan Vokasi, Penelitian & Pengembangan, dan Padat Karya berdasarkan PMK 128/2019 & PP 45/2019."
            onBack={() => setPage("home")}
          />
        )}
        {page === "beamasuk" && (
          <SimulatorPage
            key="beamasuk"
            Comp={TaxBeaMasuk}
            title="Simulator Bea Masuk"
            subtitle="Pembebasan Bea Masuk untuk Impor Mesin, Barang, dan Bahan"
            onBack={() => setPage("home")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
