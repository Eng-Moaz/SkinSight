import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, Info } from "lucide-react";
import { LESIONS, LESION_ORDER } from "../lesions.js";

export default function About() {
  return (
    <section className="about-page page-wrap">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> ABOUT SKINSIGHT</div>
        <h1>Technology with a<br /><em>human perspective.</em></h1>
        <p>SkinSight is a student research project exploring how machine learning can classify skin lesion images.</p>
      </div>

      <div className="about-grid">
        <div className="about-feature">
          <div className="about-feature-icon"><HeartPulse size={25} /></div>
          <span className="step-tag">THE PURPOSE</span>
          <h2>Make model output easier to explore.</h2>
          <p>
            The project connects an image-upload website to an AI prediction service. The model was
            trained on HAM10000 (10,015 labelled photos) and returns a predicted category and
            confidence scores across seven types of skin lesions.
          </p>
        </div>
        <div className="about-facts">
          <div><span>01</span><strong>Image input</strong><p>A user-selected image is sent to the prediction service.</p></div>
          <div><span>02</span><strong>AI classification</strong><p>A trained ensemble of 3 models generates scores for seven categories.</p></div>
          <div><span>03</span><strong>Readable output</strong><p>The website presents the top prediction, score breakdown and risk label.</p></div>
        </div>
      </div>

      <div className="categories-panel">
        <span className="step-tag">MODEL SCOPE</span>
        <h2>Seven lesion categories</h2>
        <p>The model is trained to classify images into the following categories.</p>
        <div className="category-chips">
          {LESION_ORDER.map((name, i) => (
            <span key={name}><i>{String(i + 1).padStart(2, "0")}</i>{name}</span>
          ))}
        </div>
        <ul className="lesion-list" style={{ listStyle: "none", padding: 0, margin: "18px 0 0" }}>
          {LESION_ORDER.map((name) => (
            <li key={name} className="lesion" style={{ padding: "12px 0", borderTop: "1px solid #edf0f5" }}>
              <strong style={{ fontSize: 12, color: "#2c3854" }}>{name}</strong>{" "}
              <span className={LESIONS[name].risk === "high" ? "risk-high" : "risk-low"} style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 5 }}>
                {LESIONS[name].risk === "high" ? "HIGHER RISK" : "LOWER RISK"}
              </span>
              <p className="lesion-desc">{LESIONS[name].description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="about-disclaimer">
        <Info size={22} />
        <div>
          <strong>Important medical disclaimer</strong>
          <p>
            SkinSight is a student project intended for educational and research demonstration only.
            It is not a medical device, does not provide medical advice and must not be used for
            diagnosis or treatment decisions. Model predictions may be inaccurate. Always consult a
            qualified healthcare professional.
          </p>
        </div>
      </div>

      <Link to="/upload" className="primary-button" style={{ display: "inline-flex" }}>
        Explore the demo <ArrowRight size={18} />
      </Link>
    </section>
  );
}
