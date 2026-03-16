export default function MetricsCard({ label, value }) {
    return (
        <div style={{
            padding: "24px",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            minWidth: "180px",
            background: "#fafafa"
        }}>
            <div style={{ fontSize: "13px", color: "#888", marginBottom: "8px" }}>{label}</div>
            <div style={{ fontSize: "28px", fontWeight: "bold" }}>{value ?? "—"}</div>
        </div>
    );
}