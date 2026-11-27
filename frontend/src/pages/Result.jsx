import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Check, CircleAlert, ShieldCheck, Stethoscope } from "lucide-react";
import { LESION_ORDER } from "../lesions.js";

const LOW_CONFIDENCE = 0.5;
const percent = (v) => `${(v * 100).toFixed(1)}%`;
const clamp = (v) => Math.min(100, Math.max(0, v * 100));

export default function Result({ analysis, onReset }) {
  const [photo, setPhoto] = useState("");
  const file = analysis?.file;

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPhoto(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Opening /result directly (or refreshing) has no data -> back to upload.
  if (!analysis) return <Navigate to="/upload" replace />;

  const { top_type, confidence, risk, all_types } = analysis.result;
  const high = risk === "high";
  const names = Array.from(new Set([...LESION_ORDER, ...Object.keys(all_types)]));
  const values = names
    .map((name) => ({ name, value: Number(all_types[name] ?? 0) }))
    .sort((a, b) => b.value - a.value);

  return (
    <section className="workspace page-wrap" aria-labelledby="result-h">
      <div className="upload-layout" style={{ paddingTop: 40 }}>
        <div className="upload-main panel">
          <div className="result-view">
            <div className="result-success">
              <span><Check size={15} /></span> ANALYSIS COMPLETE
              <button type="button" onClick={onReset}>New analysis <ArrowUpRight size={14} /></button>
            </div>

            <div className="result-title">
              <span className="step-tag">MODEL OUTPUT</span>
              <h2 id="result-h">Here&rsquo;s what the model <em>found.</em></h2>
              <p>This is an automated prediction, not a clinical assessment.</p>
            </div>

            <div className="prediction-card">
              <div className="prediction-label">TOP PREDICTED CATEGORY</div>
              <div className="prediction-name">{top_type}</div>
              <div className="confidence-row"><span>Model confidence</span><strong>{percent(confidence)}</strong></div>
              <div className="confidence-track"><span style={{ width: `${clamp(confidence)}%` }} /></div>
            </div>

            <div className={high ? "risk-card risk-high" : "risk-card risk-low"}>
              <div className="risk-icon">{high ? <CircleAlert size={22} /> : <ShieldCheck size={22} />}</div>
              <div>
                <span className="risk-overline">{high ? "HIGH RISK" : "LOW RISK"}</span>
                <strong>{high ? "Higher-risk category" : "Lower-risk category"}</strong>
                <p>
                  {high
                    ? "The model classified this result in a higher-risk group. Please arrange an assessment with a qualified healthcare professional."
                    : "The model classified this result in a lower-risk group. This does not rule out a medical concern. Please consult a healthcare professional if you are worried or notice changes."}
                </p>
              </div>
            </div>

            {confidence < LOW_CONFIDENCE && (
              <p className="low-conf">
                The model is not very sure about this photo, so treat this result with extra caution.
              </p>
            )}

            <div className="scores-heading">
              <div><span className="step-tag">FULL BREAKDOWN</span><h3>All 7 categories</h3></div>
              <span className="scores-caption">Model confidence scores</span>
            </div>
            <div className="scores-list">
              {values.map((item, i) => (
                <div className="score-item" key={item.name}>
                  <div className="score-meta">
                    <span>
                      <i className={i === 0 ? "score-rank top" : "score-rank"}>{String(i + 1).padStart(2, "0")}</i>
                      {item.name}
                    </span>
                    <strong>{percent(item.value)}</strong>
                  </div>
                  <div
                    className="score-track"
                    role="progressbar"
                    aria-label={item.name}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(item.value * 100)}
                  >
                    <span
                      className={i === 0 ? "score-fill score-fill-top" : "score-fill"}
                      style={{ width: `${Math.max(clamp(item.value), 0.8)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="doctor-note" role="note">
              <Stethoscope size={20} />
              <div>
                <strong>Please see a doctor for medical advice.</strong>
                <p>
                  AI predictions can be wrong. Only a qualified healthcare professional can assess a
                  skin lesion and provide a diagnosis.
                </p>
              </div>
            </div>

            <button type="button" className="primary-button full-button" onClick={onReset}>
              Analyze another image <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <aside className="side-column">
          <div className="side-card photo-card">
            {photo && <img src={photo} alt="The photo you uploaded" />}
            <p>Your photo</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
