import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getHoldings, getMetrics } from "../api/client";
import MetricsCard from "../components/MetricsCard";
import SectorChart from "../components/SectorChart";
import HoldingsTable from "../components/HoldingsTable";
import CorrelationHeatmap from "../components/CorrelationHeatmap";
import AIAnalysis from "../components/AIAnalysis";

export default function Dashboard() {
    const { portfolioId } = useParams();
    const navigate = useNavigate();
    const [holdings, setHoldings] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [h, m] = await Promise.all([
                    getHoldings(portfolioId),
                    getMetrics(portfolioId),
                ]);
                setHoldings(h);
                setMetrics(m);
            } catch (err) {
                console.error("Failed to load portfolio data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [portfolioId]);

    if (loading) {
        return (
            <div style={styles.loadingPage}>
                <div style={styles.loadingInner}>
                    <div style={styles.loadingDot} />
                    <p style={styles.loadingText}>Loading portfolio</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <span style={styles.wordmark}>Insights</span>
                <button style={styles.backBtn} onClick={() => navigate("/")}>
                    ← New upload
                </button>
            </nav>

            <main style={styles.main}>
                <div style={styles.pageHeader}>
                    <p style={styles.pageEyebrow}>Portfolio Analysis</p>
                    <h1 style={styles.pageTitle}>Your holdings, deeply understood.</h1>
                </div>

                {metrics?.ai_analysis && (
                    <section style={styles.section}>
                        <AIAnalysis analysis={metrics.ai_analysis} />
                    </section>
                )}

                <section style={styles.section}>
                    <p style={styles.sectionLabel}>Key Metrics</p>
                    <div style={styles.metricsRow}>
                        <MetricsCard
                            label="Sharpe Ratio"
                            value={metrics?.sharpe_ratio}
                            hint="Risk-adjusted return. Above 1.0 is good."
                        />
                        <MetricsCard
                            label="Portfolio Beta"
                            value={metrics?.portfolio_beta}
                            hint="Market sensitivity. 1.0 = moves with the market."
                        />
                        <MetricsCard
                            label="Max Drawdown"
                            value={metrics?.max_drawdown != null ? `${metrics.max_drawdown}%` : null}
                            hint="Worst peak-to-trough loss over 2 years."
                            negative
                        />
                    </div>
                </section>

                <section style={styles.section}>
                    <div style={styles.chartsRow}>
                        <div style={styles.chartCard}>
                            <p style={styles.sectionLabel}>Sector Allocation</p>
                            <SectorChart data={metrics?.sector_data} />
                        </div>
                        <div style={styles.chartCard}>
                            <p style={styles.sectionLabel}>Correlation Matrix</p>
                            <CorrelationHeatmap correlation={metrics?.correlation} />
                        </div>
                    </div>
                </section>

                <section style={styles.section}>
                    <p style={styles.sectionLabel}>Holdings</p>
                    <HoldingsTable holdings={holdings} />
                </section>
            </main>
        </div>
    );
}

const styles = {
    page: { minHeight: "100vh", background: "var(--bg)" },
    nav: {
        padding: "24px 48px",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        background: "var(--bg)",
        zIndex: 10,
    },
    wordmark: {
        fontFamily: "var(--font-serif)",
        fontSize: "22px",
        letterSpacing: "-0.03em",
        color: "var(--text-primary)",
    },
    backBtn: {
        background: "none",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "8px 16px",
        fontSize: "13px",
        color: "var(--text-secondary)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
    },
    main: {
        maxWidth: "1080px",
        margin: "0 auto",
        padding: "56px 48px 96px",
    },
    pageHeader: { marginBottom: "56px" },
    pageEyebrow: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "12px",
    },
    pageTitle: {
        fontFamily: "var(--font-serif)",
        fontSize: "clamp(28px, 4vw, 42px)",
        fontWeight: "400",
        letterSpacing: "-0.02em",
        color: "var(--text-primary)",
        lineHeight: "1.2",
    },
    section: { marginBottom: "64px" },
    sectionLabel: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "20px",
    },
    metricsRow: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "var(--border-light)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
    },
    chartsRow: {
        display: "grid",
        gridTemplateColumns: "1fr 1.4fr",
        gap: "24px",
    },
    chartCard: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)",
        padding: "28px",
    },
    loadingPage: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
    },
    loadingInner: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
    },
    loadingDot: {
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: "var(--text-muted)",
    },
    loadingText: {
        fontSize: "13px",
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
    },
};