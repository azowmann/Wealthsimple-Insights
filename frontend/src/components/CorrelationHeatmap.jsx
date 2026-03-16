export default function CorrelationHeatmap({ correlation }) {
    if (!correlation) return null;

    const tickers = Object.keys(correlation);

    const getStyle = (val) => {
        if (val === undefined) return { background: "#F5F4EF", color: "var(--text-muted)" };
        if (val >= 0.9) return { background: "#1A1A1A", color: "#FFFFFF" };
        if (val >= 0.6) return { background: "#3D3D3D", color: "#FFFFFF" };
        if (val >= 0.3) return { background: "#B8B4A8", color: "#1A1A1A" };
        if (val >= 0) return { background: "#E8E6DF", color: "#6B6B6B" };
        return { background: "#FDECEA", color: "var(--red)" };
    };

    return (
        <div style={{ overflowX: "auto", marginTop: "8px" }}>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}></th>
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
                                const cellStyle = getStyle(val);
                                return (
                                    <td key={col} style={{ ...styles.cell, ...cellStyle }}>
                                        {val !== undefined ? val.toFixed(2) : "—"}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const styles = {
    table: {
        borderCollapse: "separate",
        borderSpacing: "3px",
        fontSize: "13px",
    },
    th: {
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: "500",
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
        textAlign: "center",
    },
    rowLabel: {
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: "500",
        color: "var(--text-muted)",
        letterSpacing: "0.05em",
        textAlign: "right",
        whiteSpace: "nowrap",
    },
    cell: {
        padding: "10px 14px",
        textAlign: "center",
        borderRadius: "6px",
        minWidth: "56px",
        fontWeight: "500",
        transition: "opacity 0.15s",
    },
};