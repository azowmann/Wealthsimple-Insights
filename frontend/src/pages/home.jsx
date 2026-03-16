import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadPortfolio } from "../api/client";

export default function Home() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const data = await uploadPortfolio(file);
            navigate(`/dashboard/${data.portfolio_id}`);
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "60px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Wealthsimple Portfolio Analyzer</h1>
            <p>Upload a screenshot of your Wealthsimple holdings page to get deep portfolio analytics.</p>

            <div style={{ marginTop: "32px" }}>
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files[0])}
                />
            </div>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={loading}
                    style={{ marginTop: "16px", padding: "10px 24px", cursor: "pointer" }}
                >
                    {loading ? "Analyzing..." : "Analyze Portfolio"}
                </button>
            )}

            {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}
        </div>
    );
}