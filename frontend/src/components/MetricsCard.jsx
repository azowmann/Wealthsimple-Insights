export default function MetricsCard({ label, value, hint, negative }) {
    const displayValue = value ?? "—";
    const isNegative = negative && value != null;

    return (
        <div style={styles.card}>
            <p style={styles.label}>{label}</p>
            <p style={{
                ...styles.value,
                color: isNegative ? "var(--red)" : "var(--text-primary)",
            }}>
                {displayValue}
            </p>
            {hint && <p style={styles.hint}>{hint}</p>}
        </div>
    );
}

const styles = {
    card: {
        background: "var(--bg-card)",
        padding: "32px 28px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    label: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
    },
    value: {
        fontFamily: "var(--font-serif)",
        fontSize: "36px",
        fontWeight: "400",
        letterSpacing: "-0.02em",
        lineHeight: "1",
        color: "var(--text-primary)",
    },
    hint: {
        fontSize: "12px",
        color: "var(--text-muted)",
        lineHeight: "1.5",
        marginTop: "4px",
    },
};