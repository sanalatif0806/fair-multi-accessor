import { CATEGORY_ICONS, CATEGORY_LABELS } from "../lib/categories";

const AGREEMENT_COLOR = { high: "#16a34a", medium: "#d97706", low: "#dc2626", single_tool: "#6b7280" };


export default function DatasetCircleGallery({ rows, onSelect }) {
  if (rows.length === 0) {
    return <p className="view-panel__note">No knowledge graphs match this filter.</p>;
  }

  return (
    <div className="dataset-gallery">
      {rows.map((r) => {
        const color = AGREEMENT_COLOR[r.consensus?.agreement] || "#6b7280";
        const score = r.consensus?.overall;
        return (
          <button
            key={`${r.category || ""}|${r.repository || ""}|${r.id}`}
            className="dataset-circle"
            style={{ borderColor: color, background: `${color}14` }}
            onClick={() => onSelect(r)}
            title={`${r.id} — consensus ${score != null ? score.toFixed(3) : "—"} (${r.consensus?.agreement || "n/a"})`}
          >
            <span className="dataset-circle__score" style={{ color }}>
              {score != null ? score.toFixed(2) : "—"}
            </span>
            <span className="dataset-circle__id">{r.id}</span>
            {r.category && (
              <span className="dataset-circle__cat">
                {CATEGORY_ICONS[r.category] || "📁"} {CATEGORY_LABELS[r.category] || r.category}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
