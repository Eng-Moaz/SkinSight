import { riskOf } from "../lesions.js";

const pct = (p) => `${(p * 100).toFixed(1)}%`;

export default function ProbabilityBars({ allTypes, topType }) {
  const rows = Object.entries(allTypes).sort((a, b) => b[1] - a[1]);

  return (
    <ul className="bars" aria-label="Probability for each lesion type">
      {rows.map(([name, p]) => {
        const isTop = name === topType;
        return (
          <li key={name} className={isTop ? "bar-row top" : "bar-row"}>
            <div className="bar-head">
              <span className="bar-name">
                {name}
                <span className={`dot dot-${riskOf(name)}`} aria-hidden="true" />
                <span className="sr-only"> ({riskOf(name)} risk type)</span>
              </span>
              <span className="bar-value">{pct(p)}</span>
            </div>
            <div
              className="bar-track"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(p * 100)}
              aria-label={name}
            >
              <div className="bar-fill" style={{ width: `${Math.max(p * 100, 0.5)}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
