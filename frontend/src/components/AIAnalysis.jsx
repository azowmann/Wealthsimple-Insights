export default function AIAnalysis({ analysis }) {
    if (!analysis) return null;

    const { health_score, health_summary, strengths, risk_flags, recommendations } = analysis;

    const scoreColor =
        health_score >= 8 ? "var(--green)" :
            health_score >= 5 ? "#D97706" :
                "var(--red)";

    const scoreLabel =
        health_score >= 8 ? "Strong" :
            health_score >= 6 ? "Moderate" :
                health_score >= 4 ? "Weak" : "Poor";

    return (
        <div style={styles.wrapper}>
            {/* Top row: title + score badge */}
            <div style={styles.topRow}>
                <div style={styles.titleBlock}>
                    <p style={styles.eyebrow}>AI Analysis</p>
                    <h2 style={styles.title}>Portfolio Health</h2>
                </div>

                {health_score != null && (
                    <div style={{ ...styles.scoreBadge, borderColor: scoreColor }}>
                        <span style={{ ...styles.scoreNum, color: scoreColor }}>
                            {health_score}
                        </span>
                        <span style={styles.scoreSuffix}>/10</span>
                        <span style={{ ...styles.scoreTag, color: scoreColor }}>
                            {scoreLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* Summary */}
            {health_summary && (
                <p style={styles.summary}>{health_summary}</p>
            )}

            {/* Divider */}
            <div style={styles.divider} />

            {/* Three columns */}
            <div style={styles.cols}>
                <Column title="Strengths" items={strengths} accent="var(--green)" marker="+" />
                <Column title="Risk Flags" items={risk_flags} accent="var(--red)" marker="!" />
                <Column title="Recommendations" items={recommendations} accent="var(--text-muted)" marker="→" />
            </div>
        </div>
    );
}

function Column({ title, items, accent, marker }) {
    if (!items?.length) return null;
    return (
        <div style={colStyles.col}>
            <p style={colStyles.title}>{title}</p>
            <ul style={colStyles.list}>
                {items.map((item, i) => (
                    <li key={i} style={colStyles.item}>
                        <span style={{ ...colStyles.marker, color: accent }}>{marker}</span>
                        <span style={colStyles.text}>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    wrapper: {
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)",
        padding: "36px",
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "24px",
    },
    titleBlock: {},
    eyebrow: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "6px",
    },
    title: {
        fontFamily: "var(--font-serif)",
        fontSize: "24px",
        fontWeight: "400",
        letterSpacing: "-0.02em",
        color: "var(--text-primary)",
    },
    scoreBadge: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        border: "1.5px solid",
        borderRadius: "var(--radius-sm)",
        padding: "12px 18px",
        minWidth: "72px",
        gap: "2px",
    },
    scoreNum: {
        fontFamily: "var(--font-serif)",
        fontSize: "30px",
        lineHeight: "1",
        fontWeight: "400",
    },
    scoreSuffix: {
        fontSize: "11px",
        color: "var(--text-muted)",
    },
    scoreTag: {
        fontSize: "10px",
        fontWeight: "600",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginTop: "2px",
    },
    summary: {
        fontSize: "15px",
        color: "var(--text-secondary)",
        lineHeight: "1.75",
        marginBottom: "28px",
    },
    divider: {
        height: "1px",
        background: "var(--border-light)",
        marginBottom: "28px",
    },
    cols: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "32px",
    },
};

const colStyles = {
    col: {},
    title: {
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "14px",
    },
    list: {
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    item: {
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
    },
    marker: {
        fontSize: "13px",
        fontWeight: "700",
        flexShrink: 0,
        marginTop: "1px",
        width: "14px",
    },
    text: {
        fontSize: "13px",
        color: "var(--text-primary)",
        lineHeight: "1.6",
    },
};