export default function HoldingsTable({ holdings }) {
    if (!holdings.length) return null;

    return (
        <div style={styles.wrapper}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        {["Ticker", "Shares", "Market Value", "Currency", "Gain / Loss", "Sector", "Beta"].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {holdings.map((h, i) => {
                        const isPositive = h.gain_loss_pct >= 0;
                        return (
                            <tr key={h.id} style={styles.row}>
                                <td style={{ ...styles.td, ...styles.tickerCell }}>
                                    {h.ticker}
                                </td>
                                <td style={{ ...styles.td, ...styles.numCell }}>
                                    {h.shares ?? "—"}
                                </td>
                                <td style={{ ...styles.td, ...styles.numCell }}>
                                    ${h.market_value?.toLocaleString("en-CA", { minimumFractionDigits: 2 })}
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.pill,
                                        background: h.currency === "USD" ? "#EEF2FF" : "#F0F4EE",
                                        color: h.currency === "USD" ? "#3730A3" : "#166534",
                                    }}>
                                        {h.currency}
                                    </span>
                                </td>
                                <td style={{
                                    ...styles.td,
                                    ...styles.numCell,
                                    color: isPositive ? "var(--green)" : "var(--red)",
                                    fontWeight: "500",
                                }}>
                                    {isPositive ? "+" : ""}{h.gain_loss_pct}%
                                </td>
                                <td style={{ ...styles.td, color: "var(--text-secondary)" }}>
                                    {h.sector ?? "—"}
                                </td>
                                <td style={{ ...styles.td, ...styles.numCell, color: "var(--text-secondary)" }}>
                                    {h.beta ?? "—"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    wrapper: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13.5px",
    },
    th: {
        textAlign: "left",
        padding: "14px 20px",
        fontSize: "10.5px",
        fontWeight: "600",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        borderBottom: "1px solid var(--border-light)",
        background: "var(--bg)",
        whiteSpace: "nowrap",
    },
    row: {
        borderBottom: "1px solid var(--border-light)",
        transition: "background 0.1s",
    },
    td: {
        padding: "16px 20px",
        color: "var(--text-primary)",
        verticalAlign: "middle",
    },
    tickerCell: {
        fontWeight: "600",
        letterSpacing: "0.02em",
        fontFamily: "var(--font-sans)",
    },
    numCell: {
        fontVariantNumeric: "tabular-nums",
    },
    pill: {
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.04em",
    },
};