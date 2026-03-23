import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getHoldings, getMetrics } from "../api/client";
import MetricsCard from "../components/MetricsCard";
import SectorChart from "../components/SectorChart";
import HoldingsTable from "../components/HoldingsTable";
import CorrelationHeatmap from "../components/CorrelationHeatmap";
import AIAnalysis from "../components/AIAnalysis";

export default function Dashboard() {
    const { portfolioId } = useParams();
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

    if (loading) return <div style={{ padding: "60px" }}>Loading your portfolio...</div>;

    return (
        <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto" }}>
            <h1>Portfolio Dashboard</h1>

            {/* AI Analysis — shown first so it frames the data below */}
            {metrics?.ai_analysis && (
                <div style={{ marginTop: "32px" }}>
                    <AIAnalysis analysis={metrics.ai_analysis} />
                </div>
            )}

            {/* Metrics Cards */}
            <div style={{ display: "flex", gap: "16px", marginTop: "40px", flexWrap: "wrap" }}>
                <MetricsCard label="Sharpe Ratio" value={metrics?.sharpe_ratio} />
                <MetricsCard label="Portfolio Beta" value={metrics?.portfolio_beta} />
                <MetricsCard label="Max Drawdown" value={`${metrics?.max_drawdown}%`} />
            </div>

            {/* Sector Chart */}
            <div style={{ marginTop: "48px" }}>
                <h2>Sector Allocation</h2>
                <SectorChart data={metrics?.sector_data} />
            </div>

            {/* Holdings Table */}
            <div style={{ marginTop: "48px" }}>
                <h2>Holdings</h2>
                <HoldingsTable holdings={holdings} />
            </div>

            {/* Correlation Heatmap */}
            <div style={{ marginTop: "48px" }}>
                <h2>Correlation Matrix</h2>
                <CorrelationHeatmap correlation={metrics?.correlation} />
            </div>
        </div>
    );
}