const COPY = {
  high: { label: "High risk", icon: "▲" },
  low: { label: "Low risk", icon: "●" },
};

export default function RiskBadge({ risk, large = false }) {
  const c = COPY[risk] ?? COPY.high;
  return (
    <span className={`risk-badge risk-${risk}${large ? " large" : ""}`}>
      <span aria-hidden="true">{c.icon}</span> {c.label}
    </span>
  );
}
