export default function AIAnalysis({ analysis }) {
    if (!analysis) return null;

    const { health_score, health_summary, strengths, risk_flags, recommendations } = analysis;

    const scoreColor =
        health_score >= 8 ? "var(--green)" :
            health_score >= 5 ? "#F59E0B" :
                "var(--red)";

    const scoreLabel =
        health_score >= 8 ? "Strong" :
            health_score >= 6 ? "Moderate" :
                health_score >= 4 ? "Weak" :
                    "Poor";

    return (
        <div style={styles.wrapper}>
            {/* Header row */}
            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>AI Analysis</p>
                    <h2 style={styles.title}>Portfolio Health</h2>
                </div>
                {health_score != null && (
                    <div style={styles.scoreRing}>
                        <span style={{ ...styles.scoreNumber, color: scoreColor }}>
                            {health_score}
                        </span>
                        <span style={styles.scoreDenom}>/10</span>
                        <span style={{ ...styles.scoreLabel, color: scoreColor }}>
                            {scoreLabel}
                        </span>
                    </div>
                )}
            </div>

            {/* Health summary */}
            {health_summary && (
                <p style={styles.summary}>{health_summary}</p>
            )}

            {/* Three columns: strengths / risks / recommendations */}
            <div style={styles.grid}>
                <Section
                    title="Strengths"
                    items={strengths}
                    icon="↑"
                    iconColor="var(--green)"
                    iconBg="var(--green-bg)"
                />
                <Section
                    title="Risk Flags"
                    items={risk_flags}
                    icon="!"
                    iconColor="var(--red)"
                    iconBg="var(--red-bg)"
                />
                <Section
                    title="Recommendations"
                    items={recommendations}
                    icon="→"
                    iconColor="#6B6B6B"
                    iconBg="#F0EFE9"
                />
            </div>
        </div>
    );
}

function Section({ title, items, icon, iconColor, iconBg }) {
    if (!items?.length) return null;
    return (
        <div style={styles.section}>
            <p style={styles.sectionTitle}>{title}</p>
            <ul style={styles.list}>
                {items.map((item, i) => (
                    <li key={i} style={styles.listItem}>
                        <span style={{ ...styles.bullet, color: iconColor, background: iconBg }}>
                            {icon}
                        </span>
                        <span style={styles.itemText}>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    wrapper: {
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "32px",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "20px",
    },
    eyebrow: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "4px",
    },
    title: {
        fontSize: "22px",
        fontFamily: "var(--font-serif)",
        fontWeight: "400",
        color: "var(--text-primary)",
    },
    scoreRing: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "var(--bg)",
        border: "1px solid var(--border-light)",
        borderRadius: "var(--radius)",
        padding: "12px 20px",
        minWidth: "80px",
    },
    scoreNumber: {
        fontSize: "32px",
        fontFamily: "var(--font-serif)",
        lineHeight: "1",
    },
    scoreDenom: {
        fontSize: "12px",
        color: "var(--text-muted)",
        marginBottom: "4px",
    },
    scoreLabel: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
    },
    summary: {
        fontSize: "15px",
        color: "var(--text-secondary)",
        lineHeight: "1.7",
        padding: "16px 20px",
        background: "var(--bg)",
        borderRadius: "var(--radius-sm)",
        marginBottom: "28px",
        borderLeft: "3px solid var(--border)",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "24px",
    },
    section: {},
    sectionTitle: {
        fontSize: "11px",
        fontWeight: "500",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "12px",
    },
    list: {
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    listItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
    },
    bullet: {
        flexShrink: 0,
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: "700",
        marginTop: "1px",
    },
    itemText: {
        fontSize: "14px",
        color: "var(--text-primary)",
        lineHeight: "1.55",
    },
};