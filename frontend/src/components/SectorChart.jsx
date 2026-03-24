import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#1A1A1A", "#00C07F", "#9A9A9A", "#C8C4BB", "#3D3D3D", "#6B6B6B"];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div style={{
                background: "var(--text-primary)",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
            }}>
                <strong>{payload[0].name}</strong>
                <span style={{ marginLeft: "8px", opacity: 0.75 }}>{payload[0].value}%</span>
            </div>
        );
    }
    return null;
};

const renderLegend = (props) => {
    const { payload } = props;
    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px 16px",
            justifyContent: "center",
            marginTop: "16px",
        }}>
            {payload.map((entry, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "2px",
                        background: entry.color,
                        flexShrink: 0,
                    }} />
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function SectorChart({ data }) {
    if (!data) return null;

    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                >
                    {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={renderLegend} />
            </PieChart>
        </ResponsiveContainer>
    );
}