import { Link } from "react-router-dom";
import {
  Activity, ArrowRight, ArrowUpRight, BadgeCheck, Check, ChevronRight, Microscope, UploadCloud,
} from "lucide-react";

const STEPS = [
  { n: "01", icon: <UploadCloud />, title: "Upload a photo", text: "Choose a clear image of a skin spot from your device." },
  { n: "02", icon: <Microscope />, title: "AI analyzes", text: "The prediction service evaluates the image across seven lesion categories." },
  { n: "03", icon: <Activity />, title: "Explore results", text: "Review the predicted category, confidence scores and risk label." },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="hero page-wrap">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A CLOSER LOOK AT SKIN HEALTH</div>
          <h1>Understand what<br />you <em>see.</em></h1>
          <p className="hero-lead">
            An AI-powered research tool that explores skin lesion image classification, turning
            complex model predictions into information that is easier to understand.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="primary-button">Analyze an image <ArrowRight size={18} /></Link>
            <Link to="/about" className="quiet-button">Explore the project <ChevronRight size={17} /></Link>
          </div>
          <div className="hero-note">
            <span className="note-check"><Check size={13} /></span> Educational research demo
            <span className="note-separator">&middot;</span> Not a medical diagnosis
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="visual-card">
            <div className="visual-card-top">
              <span><span className="live-dot" /> MODEL OVERVIEW</span>
              <span className="visual-index">01 / 07</span>
            </div>
            <div className="scan-art">
              <div className="scan-ring ring-a" /><div className="scan-ring ring-b" />
              <div className="scan-core"><Microscope size={48} strokeWidth={1.2} /></div>
              <span className="scan-point point-a" /><span className="scan-point point-b" /><span className="scan-point point-c" />
            </div>
            <div className="visual-card-bottom">
              <div><span className="muted-label">IMAGE CLASSIFICATION</span><strong>7 lesion categories</strong></div>
              <div className="mini-bars"><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
          </div>
          <div className="float-chip chip-top">
            <span className="chip-icon"><Activity size={16} /></span>
            <span><small>AI-ASSISTED</small><strong>Image analysis</strong></span>
          </div>
          <div className="float-chip chip-bottom">
            <span className="chip-icon green"><BadgeCheck size={17} /></span>
            <span><small>BUILT FOR LEARNING</small><strong>Research project</strong></span>
          </div>
          <div className="hero-stamp"><span>SKIN</span><strong>+</strong><span>SCIENCE</span></div>
        </div>
      </section>

      <section className="steps-section">
        <div className="page-wrap">
          <div className="section-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> SIMPLE BY DESIGN</div>
              <h2>Three steps.<br /><em>One clearer picture.</em></h2>
            </div>
            <p>Explore how the SkinSight prototype turns an image into a model-generated prediction.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <article key={s.n} className="step-card">
                <div className="step-top"><span>{s.n}</span><div className="step-icon">{s.icon}</div></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <div className="step-line" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section page-wrap">
        <div className="cta-panel">
          <div>
            <div className="eyebrow light"><span className="eyebrow-line" /> START EXPLORING</div>
            <h2>Curious about how<br />it works?</h2>
            <p>Try the image analysis experience and explore the model output.</p>
          </div>
          <Link to="/upload" className="light-button">Check an image <ArrowUpRight size={18} /></Link>
          <div className="cta-decoration"><Activity size={150} strokeWidth={0.5} /></div>
        </div>
      </section>
    </div>
  );
}
