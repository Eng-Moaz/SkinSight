import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircleAlert, FileImage, Info, LoaderCircle, ShieldCheck, UploadCloud, X } from "lucide-react";
import { predictImage, validateFile, ApiError } from "../api.js";

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export default function Upload({ onDone }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!file) return undefined;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Cancel an in-flight request if the user leaves the page.
  useEffect(() => () => abortRef.current?.abort(), []);

  const choose = (picked) => {
    if (!picked) return;
    const problem = validateFile(picked);
    if (problem) {
      setError(problem);
      setFile(null);
      setPreview("");
      return;
    }
    setError("");
    setFile(picked);
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  const analyze = async () => {
    const problem = validateFile(file);
    if (problem) return setError(problem);
    setError("");
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const result = await predictImage(file, { signal: controller.signal });
      onDone({ file, result });
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err instanceof ApiError ? err.message : "Something unexpected happened. Please try again.");
      setLoading(false);
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <section className="workspace page-wrap" aria-labelledby="upload-h">
      <div className="page-heading">
        <div className="eyebrow"><span className="eyebrow-line" /> IMAGE ANALYSIS</div>
        <h1 id="upload-h">Let&rsquo;s take a closer <em>look.</em></h1>
        <p>Upload a clear photo of a skin spot to see the model&rsquo;s predicted classification.</p>
      </div>

      <div className="upload-layout">
        <div className="upload-main panel">
          <div className="panel-head">
            <div><span className="step-tag">STEP 01</span><h2>Upload your image</h2></div>
            <span className="format-tag">MAX 10 MB</span>
          </div>

          {!file ? (
            <div
              className="dropzone"
              role="button"
              tabIndex={0}
              aria-label="Choose a photo from your device"
              onClick={openPicker}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPicker();
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                choose(e.dataTransfer.files?.[0]);
              }}
            >
              <div className="upload-icon"><UploadCloud size={27} /></div>
              <h3>Drop your image here</h3>
              <p>or <span>browse files</span> from your device</p>
              <div className="file-types"><span>JPG</span><span>PNG</span><span>WEBP</span></div>
            </div>
          ) : (
            <div className="preview-area">
              <div className="preview-image-wrap">
                <img src={preview || undefined} alt="Preview of the selected skin photo" />
              </div>
              <div className="preview-meta">
                <div className="file-icon"><FileImage size={19} /></div>
                <div className="file-info">
                  <strong>{file.name}</strong>
                  <span>{formatSize(file.size)} &middot; Image ready</span>
                </div>
                {!loading && (
                  <button type="button" className="icon-button" onClick={reset} aria-label="Remove image">
                    <X size={18} />
                  </button>
                )}
              </div>
              {!loading && (
                <button type="button" className="text-button" onClick={openPicker}>
                  Choose a different image
                </button>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => choose(e.target.files?.[0])}
          />

          {error && (
            <div className="error-message" role="alert">
              <CircleAlert size={17} />
              <span>
                {error}
                {file && (
                  <>
                    {" "}
                    <button type="button" className="text-button" onClick={analyze}>Try again</button>
                  </>
                )}
              </span>
            </div>
          )}

          <div className="upload-actions">
            <button type="button" className="primary-button" disabled={!file || loading} onClick={analyze}>
              {loading ? (
                <><LoaderCircle className="spin" size={18} /> Analyzing image...</>
              ) : (
                <>Analyze image <ArrowRight size={18} /></>
              )}
            </button>
            {loading && (
              <button type="button" className="secondary-button" onClick={cancel}>Cancel</button>
            )}
            {file && !loading && (
              <button type="button" className="secondary-button" onClick={reset}>Remove</button>
            )}
          </div>
          <div role="status" aria-live="polite" className="sr-only">{loading ? "Analyzing your photo" : ""}</div>
        </div>

        <aside className="side-column">
          <div className="side-card guidance-card">
            <div className="side-icon"><ShieldCheck size={20} /></div>
            <h3>For a better result</h3>
            <ul>
              <li>Use a clear, focused photo.</li>
              <li>Make sure the spot is well lit.</li>
              <li>Avoid filters and heavy shadows.</li>
              <li>Keep the skin spot centered.</li>
            </ul>
          </div>
          <div className="side-card privacy-card">
            <div className="side-icon pale"><Info size={20} /></div>
            <h3>Your image</h3>
            <p>
              This first version does not save a history of your checks. Your image is sent to the
              prediction service for analysis only.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
