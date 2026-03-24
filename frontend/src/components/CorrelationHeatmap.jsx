export default function CorrelationHeatmap({ correlation }) {
    if (!correlation) return null;

    const tickers = Object.keys(correlation);

    const getCellStyle = (val) => {
        if (val === undefined) return { background: "var(--bg)", color: "var(--text-muted)" };
        if (val >= 0.9) return { background: "#1A1A1A", color: "#FFFFFF" };
        if (val >= 0.6) return { background: "#4A4A4A", color: "#FFFFFF" };
        if (val >= 0.3) return { background: "#C0BCB4", color: "#1A1A1A" };
        if (val >= 0) return { background: "#E8E6DF", color: "#6B6B6B" };
        return { background: "#FDECEA", color: "var(--red)" };
    };

    return (
        <div>
            <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.corner} />
                            {tickers.map(t => (
                                <th key={t} style={styles.th}>{t}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tickers.map(row => (
                            <tr key={row}>
                                <td style={styles.rowLabel}>{row}</td>
                                {tickers.map(col => {
                                    const val = correlation[row]?.[col];
                                    return (
                                        <td key={col} style={{ ...styles.cell, ...getCellStyle(val) }}>
                                            {val !== undefined ? val.toFixed(2) : "—"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Scale legend */}
            <div style={styles.legend}>
                {[
                    { label: "0.9+", bg: "#1A1A1A", color: "#fff" },
                    { label: "0.6", bg: "#4A4A4A", color: "#fff" },
                    { label: "0.3", bg: "#C0BCB4", color: "#1A1A1A" },
                    { label: "0.0", bg: "#E8E6DF", color: "#6B6B6B" },
                    { label: "neg", bg: "#FDECEA", color: "var(--red)" },
                ].map(s => (
                    <div key={s.label} style={styles.legendItem}>
                        <div style={{ ...styles.legendSwatch, background: s.bg }} />
                        <span style={{ ...styles.legendLabel, color: s.color === "#fff" ? "var(--text-secondary)" : s.color }}>
                            {s.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    table: {
        borderCollapse: "separate",
        borderSpacing: "3px",
        fontSize: "12px",
        width: "100%",
    },
    corner: { padding: "0 8px" },
    th: {
        padding: "4px 8px",
        fontSize: "10.5px",
        fontWeight: "600",
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
        textAlign: "center",
        whiteSpace: "nowrap",
    },
    rowLabel: {
        padding: "4px 8px",
        fontSize: "10.5px",
        fontWeight: "600",
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
        textAlign: "right",
        whiteSpace: "nowrap",
    },
    cell: {
        padding: "9px 12px",
        textAlign: "center",
        borderRadius: "5px",
        minWidth: "52px",
        fontWeight: "500",
        fontVariantNumeric: "tabular-nums",
    },
    legend: {
        display: "flex",
        gap: "12px",
        marginTop: "16px",
        alignItems: "center",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: "5px",
    },
    legendSwatch: {
        width: "10px",
        height: "10px",
        borderRadius: "2px",
    },
    legendLabel: {
        fontSize: "11px",
        color: "var(--text-muted)",
    },
};