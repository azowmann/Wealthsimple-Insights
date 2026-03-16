import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPortfolio } from "../api/client";

export default function Home() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    const handleFile = (f) => {
        if (f && /\.(png|jpe?g)$/i.test(f.name)) {
            setFile(f);
            setError(null);
        } else {
            setError("Please upload a PNG or JPG file.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const data = await uploadPortfolio(file);
            navigate(`/dashboard/${data.portfolio_id}`);
        } catch {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <nav style={styles.nav}>
                <span style={styles.wordmark}>Insights</span>
            </nav>

            <main style={styles.main}>
                <div style={styles.hero}>
                    <p style={styles.eyebrow}>Portfolio Analysis</p>
                    <h1 style={styles.headline}>
                        Understand your<br />
                        <em>investments deeply.</em>
                    </h1>
                    <p style={styles.subtext}>
                        Upload a screenshot of your Wealthsimple holdings page.<br />
                        We'll do the rest.
                    </p>
                </div>

                <div
                    style={{
                        ...styles.dropzone,
                        ...(dragging ? styles.dropzoneDragging : {}),
                        ...(file ? styles.dropzoneActive : {}),
                    }}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        style={{ display: "none" }}
                        onChange={(e) => handleFile(e.target.files[0])}
                    />
                    {file ? (
                        <div style={styles.fileSelected}>
                            <div style={styles.fileIcon}>✓</div>
                            <div>
                                <p style={styles.fileName}>{file.name}</p>
                                <p style={styles.fileHint}>Ready to analyze</p>
                            </div>
                        </div>
                    ) : (
                        <div style={styles.dropzoneContent}>
                            <div style={styles.uploadIcon}>↑</div>
                            <p style={styles.dropzoneLabel}>Drop your screenshot here</p>
                            <p style={styles.dropzoneHint}>or click to browse</p>
                        </div>
                    )}
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    style={{
                        ...styles.btn,
                        ...(!file || loading ? styles.btnDisabled : {}),
                    }}
                >
                    {loading ? (
                        <span style={styles.btnLoading}>
                            <span style={styles.spinner} />
                            Analyzing your portfolio...
                        </span>
                    ) : (
                        "Analyze portfolio"
                    )}
                </button>

                <p style={styles.disclaimer}>
                    Your screenshot is processed locally and never stored permanently.
                </p>
            </main>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
    },
    nav: {
        padding: "24px 48px",
        borderBottom: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
    },
    wordmark: {
        fontFamily: "var(--font-serif)",
        fontSize: "20px",
        letterSpacing: "-0.03em",
        color: "var(--text-primary)",
    },
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        maxWidth: "560px",
        margin: "0 auto",
        width: "100%",
        textAlign: "center",
    },
    hero: {
        textAlign: "center",
        marginBottom: "48px",
        width: "100%",
    },
    eyebrow: {
        fontSize: "12px",
        fontWeight: "500",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--text-muted)",
        marginBottom: "16px",
    },
    headline: {
        fontSize: "clamp(48px, 8vw, 72px)",
        lineHeight: "1.1",
        letterSpacing: "-0.03em",
        color: "var(--text-primary)",
        marginBottom: "20px",
    },
    subtext: {
        fontSize: "16px",
        color: "var(--text-secondary)",
        lineHeight: "1.7",
    },
    dropzone: {
        width: "100%",
        border: "1.5px dashed var(--border)",
        borderRadius: "var(--radius)",
        padding: "48px 32px",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: "var(--bg-card)",
        marginBottom: "16px",
    },
    dropzoneDragging: {
        borderColor: "var(--text-primary)",
        background: "#F0EFE9",
    },
    dropzoneActive: {
        borderColor: "var(--green)",
        borderStyle: "solid",
        background: "var(--green-bg)",
    },
    dropzoneContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
    },
    uploadIcon: {
        fontSize: "28px",
        color: "var(--text-muted)",
        marginBottom: "8px",
    },
    dropzoneLabel: {
        fontSize: "15px",
        fontWeight: "500",
        color: "var(--text-primary)",
    },
    dropzoneHint: {
        fontSize: "13px",
        color: "var(--text-muted)",
    },
    fileSelected: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        justifyContent: "center",
    },
    fileIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "var(--green)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold",
        flexShrink: 0,
    },
    fileName: {
        fontSize: "15px",
        fontWeight: "500",
        color: "var(--text-primary)",
        textAlign: "left",
    },
    fileHint: {
        fontSize: "13px",
        color: "var(--green)",
        textAlign: "left",
    },
    error: {
        color: "var(--red)",
        fontSize: "14px",
        marginBottom: "12px",
    },
    btn: {
        width: "100%",
        padding: "16px 32px",
        background: "var(--text-primary)",
        color: "#FFFFFF",
        border: "none",
        borderRadius: "var(--radius-sm)",
        fontSize: "15px",
        fontWeight: "500",
        letterSpacing: "-0.01em",
        transition: "opacity 0.15s ease, transform 0.1s ease",
        marginBottom: "16px",
    },
    btnDisabled: {
        opacity: 0.4,
        cursor: "not-allowed",
    },
    btnLoading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255,255,255,0.3)",
        borderTopColor: "#FFFFFF",
        borderRadius: "50%",
        display: "inline-block",
        animation: "spin 0.7s linear infinite",
    },
    disclaimer: {
        fontSize: "12px",
        color: "var(--text-muted)",
        textAlign: "center",
    },
};