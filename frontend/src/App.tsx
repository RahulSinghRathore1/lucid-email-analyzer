import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

type EmailRecord = {
  subject: string;
  from: string;
  to: string;
  date: string;
  esp: string;
  receivingChain: string[];
  snippet?: string;
};

function summarizeReceived(line: string) {
  const one = line.replace(/\r?\n/g, " ").replace(/\s+/g, " ");
  const from = /from\s+([^\s]+)/i.exec(one)?.[1];
  const by = /by\s+([^\s]+)/i.exec(one)?.[1];
  const withProto = /with\s+([^\s]+)/i.exec(one)?.[1];
  const ip = /\[(\d{1,3}(?:\.\d{1,3}){3})\]/.exec(one)?.[1];
  return { from, by, withProto, ip, raw: one };
}

function Badge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: "#eef2ff",
        color: "#3730a3",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

export default function App() {
  const [meta, setMeta] = useState<{
    testAddress: string;
    exampleSubject: string;
  } | null>(null);
  const [subject, setSubject] = useState("");
  const [latest, setLatest] = useState<EmailRecord | null>(null);
  const [history, setHistory] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load meta on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/mail/meta`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setMeta(data);
        setSubject(data.exampleSubject || "");
        setMetaError(null);
      })
      .catch((e) => setMetaError(e.message));
  }, []);

  // Helpers
  const exampleSubject = useMemo(() => meta?.exampleSubject || "", [meta]);

  const fetchLatest = async () => {
    setLoading(true);
    setActionError(null);
    setLatest(null);
    try {
      const q = encodeURIComponent(subject.trim() || exampleSubject);
      const res = await fetch(`${API_BASE_URL}/mail/latest?subject=${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data) {
        setActionError(
          "No matching unseen email found. Send a new email and try again."
        );
      } else {
        setLatest(data);
      }
    } catch (e: any) {
      setActionError(e.message || "Failed to fetch latest email");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/mail/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHistory(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (e: any) {
      setActionError(e.message || "Failed to load history");
    }
  };

  return (
    <div
      style={{
        padding: "28px",
        fontFamily: "Inter, system-ui, sans-serif",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
        Lucid Email Analyzer
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 24 }}>
        Send an email to the address below using the subject shown, then click{" "}
        <strong>Fetch Latest Email</strong>.
      </p>

      {/* Meta panel */}
      {metaError && (
        <p style={{ color: "crimson" }}>⚠️ Failed to load meta: {metaError}</p>
      )}
      {meta && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Test address</div>
              <div style={{ fontWeight: 700 }}>{meta.testAddress}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Example subject
              </div>
              <div style={{ fontWeight: 700 }}>{exampleSubject}</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          display: "grid",
          gap: 12,
          gridTemplateColumns: "1fr auto auto",
          alignItems: "end",
          marginBottom: 24,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              color: "#6b7280",
              marginBottom: 6,
            }}
          >
            Subject filter (must be contained in email subject)
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={exampleSubject}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={fetchLatest}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#111827",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {loading ? "Fetching…" : "Fetch Latest Email"}
        </button>
        <button
          onClick={loadHistory}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Refresh History
        </button>
      </div>

      {actionError && (
        <p style={{ color: "crimson", marginBottom: 12 }}>⚠️ {actionError}</p>
      )}

      {/* Latest result */}
      {latest && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              Latest Email
            </h2>
            <Badge label={latest.esp || "Unknown"} />
          </div>

          <div style={{ fontSize: 14, color: "#374151", marginBottom: 12 }}>
            <div>
              <strong>Subject:</strong> {latest.subject}
            </div>
            <div>
              <strong>From:</strong> {latest.from}
            </div>
            <div>
              <strong>To:</strong> {latest.to}
            </div>
            <div>
              <strong>Date:</strong> {new Date(latest.date).toLocaleString()}
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Receiving Chain
            </div>
            {latest.receivingChain?.length ? (
              <ol
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "grid",
                  gap: 10,
                }}
              >
                {latest.receivingChain.map((line, idx) => {
                  const s = summarizeReceived(line);
                  return (
                    <li
                      key={idx}
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6b7280",
                          marginBottom: 4,
                        }}
                      >
                        Hop #{idx + 1}
                      </div>
                      <div style={{ fontSize: 14 }}>
                        {s.from && (
                          <span>
                            <strong>from</strong> {s.from}{" "}
                          </span>
                        )}
                        {s.by && (
                          <span>
                            <strong>→ by</strong> {s.by}{" "}
                          </span>
                        )}
                        {s.withProto && (
                          <span>
                            <strong>with</strong> {s.withProto}{" "}
                          </span>
                        )}
                        {s.ip && (
                          <span>
                            <strong>ip</strong> {s.ip}
                          </span>
                        )}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                      >
                        {s.raw}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div style={{ color: "#6b7280" }}>No Received headers found.</div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
              History (latest 10)
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th style={{ padding: "8px 6px" }}>Date</th>
                  <th style={{ padding: "8px 6px" }}>Subject</th>
                  <th style={{ padding: "8px 6px" }}>From</th>
                  <th style={{ padding: "8px 6px" }}>ESP</th>
                  <th style={{ padding: "8px 6px" }}>Hops</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 6px", whiteSpace: "nowrap" }}>
                      {new Date(h.date).toLocaleString()}
                    </td>
                    <td style={{ padding: "8px 6px" }}>{h.subject}</td>
                    <td style={{ padding: "8px 6px" }}>{h.from}</td>
                    <td style={{ padding: "8px 6px" }}>{h.esp}</td>
                    <td style={{ padding: "8px 6px" }}>
                      {h.receivingChain?.length || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
