import { useEffect, useState } from "react";
import { fetchSnapshots, fetchLiveCatalogs, runSnapshotNow, downloadUrl } from "../api/snapshots";

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}


export default function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState([]);
  const [liveCatalogs, setLiveCatalogs] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const snaps = await fetchSnapshots();
      setSnapshots(snaps);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRunNow() {
    setRunning(true);
    setError("");
    try {
      await runSnapshotNow();
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setRunning(false);
    }
  }

  async function handleLoadLiveCatalogs() {
    setLiveLoading(true);
    try {
      const data = await fetchLiveCatalogs();
      setLiveCatalogs(data);
    } catch (e) {
      setError(e?.response?.data?.detail || e.message);
    } finally {
      setLiveLoading(false);
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Snapshots</h1>
        <p>
          Timestamped archives of the full corpus assessment, generated automatically on the 1st of
          each month (and available to trigger manually below) — download any run, same as
          KGHeartBeat's own periodic archive.
        </p>
      </header>

      <div className="corpus-controls">
        <button onClick={handleRunNow} disabled={running}>
          {running ? "Running…" : "Run snapshot now"}
        </button>
      </div>

      {error && <p className="input-panel__error">{error}</p>}

      <h3>Live catalogs</h3>
      <p className="view-panel__note">
        Real-time counts fetched directly from each connected repository's own API — not stored,
        not FAIR-assessed, just showing what's currently in each catalog. A source failing here
        (e.g. a 403) means that specific external service rejected this deployment's request, not
        that the data shown elsewhere is wrong.
      </p>
      <button onClick={handleLoadLiveCatalogs} disabled={liveLoading}>
        {liveLoading ? "Fetching…" : "Fetch live catalog counts"}
      </button>
      {liveCatalogs && (
        <div className="score-table-wrap" style={{ marginTop: "12px" }}>
          <table className="score-table">
            <thead>
              <tr>
                <th>Source</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(liveCatalogs).map(([name, result]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>
                    {result.error ? (
                      <span className="cell-error">{result.error}</span>
                    ) : (
                      <>
                        <strong>{result.total}</strong> total —{" "}
                        {(result.sample || [])
                          .slice(0, 3)
                          .map((s) => s.title || s.id || s.full_name)
                          .filter(Boolean)
                          .join(", ")}
                        {(result.sample || []).length > 3 ? ", …" : ""}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ marginTop: "24px" }}>Archive — Index of /snapshots/</h3>
      {loading ? (
        <p className="view-panel__note">Loading…</p>
      ) : (
        <div className="score-table-wrap">
          <table className="score-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Last modified</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan={3} className="view-panel__note">
                    No snapshots yet.
                  </td>
                </tr>
              )}
              {snapshots.map((s) => (
                <tr key={s.filename}>
                  <td>
                    <a href={downloadUrl(s.filename)}>{s.filename}</a>
                  </td>
                  <td>{s.modified_at.slice(0, 16).replace("T", " ")}</td>
                  <td>{humanSize(s.size_bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
