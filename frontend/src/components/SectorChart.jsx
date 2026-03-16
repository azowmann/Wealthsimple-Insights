import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#1A1A1A", "#00C07F", "#6B6B6B", "#B8B4A8", "#3D3D3D", "#9A9A9A"];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div style={{
                background: "#1A1A1A",
                color: "#fff",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "13px",
            }}>
                <strong>{payload[0].name}</strong>: {payload[0].value}%
            </div>
        );
    }
    return null;
};

export default function SectorChart({ data }) {
    if (!data) return null;

    const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {chartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    formatter={(value) => (
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}