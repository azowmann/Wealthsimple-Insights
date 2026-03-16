export default function HoldingsTable({ holdings }) {
    if (!holdings.length) return null;

    return (
        <div style={styles.wrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Ticker", "Shares", "Market value", "Currency", "Gain / Loss", "Sector", "Beta"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {holdings.map((h, i) => (
                        <tr key={h.id} style={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                            <td style={{ ...styles.td, fontWeight: "500" }}>{h.ticker}</td>
                            <td style={styles.td}>{h.shares}</td>
                            <td style={styles.td}>${h.market_value?.toLocaleString("en-CA", { minimumFractionDigits: 2 })}</td>
                            <td style={styles.td}>
                                <span style={{
                                    ...styles.badge,
                                    background: h.currency === "USD" ? "#EEF2FF" : "#F0F7EE",
                                    color: h.currency === "USD" ? "#3730A3" : "#166534",
                                }}>
                                    {h.currency}
                                </span>
                            </td>
                            <td style={{
                                ...styles.td,
                                color: h.gain_loss_pct >= 0 ? "#00874F" : "var(--red)",
                                fontWeight: "500",
                            }}>
                                {h.gain_loss_pct >= 0 ? "+" : ""}{h.gain_loss_pct}%
                            </td>
                            <td style={{ ...styles.td, color: "var(--text-secondary)" }}>{h.sector ?? "—"}</td>
                            <td style={{ ...styles.td, color: "var(--text-secondary)" }}>{h.beta ?? "—"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    wrapper: {
        overflowX: "auto",
        marginTop: "16px",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "14px",
    },
    th: {
        textAlign: "left",
        padding: "10px 16px",
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border-light)",
        whiteSpace: "nowrap",
    },
    td: {
        padding: "14px 16px",
        borderBottom: "1px solid var(--border-light)",
        color: "var(--text-primary)",
    },
    rowEven: {
        background: "#FFFFFF",
    },
    rowOdd: {
        background: "#FAFAF8",
    },
    badge: {
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.05em",
    },
};