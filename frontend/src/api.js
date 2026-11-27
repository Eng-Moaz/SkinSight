import { LESION_NAMES, riskOf } from "./lesions.js";

export const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export class ApiError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Returns an error message string if the file is not acceptable, otherwise null. */
export function validateFile(file) {
  if (!file) return "Please choose a photo first.";
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "This file type is not supported. Please upload a JPG, PNG or WebP image.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "This photo is too large. The maximum size is 10 MB.";
  }
  if (file.size === 0) return "This file is empty. Please choose another photo.";
  return null;
}

/**
 * Sends the photo to the prediction service.
 * Expected response:
 *   { top_type, confidence, risk, all_types: { [name]: probability } }
 */
export async function predictImage(file, { signal } = {}) {
  if (USE_MOCK) return mockPredict(file, signal);

  const form = new FormData();
  form.append("file", file); // field name must match the FastAPI parameter

  let res;
  try {
    res = await fetch(`${API_BASE}/predict`, { method: "POST", body: form, signal });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new ApiError(
      "Could not reach the prediction service. Check your connection and try again."
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : "";
    } catch {
      /* ignore non-JSON error bodies */
    }
    if (res.status === 413) throw new ApiError("This photo is too large (max 10 MB).", { status: 413 });
    if (res.status === 415 || res.status === 422)
      throw new ApiError(detail || "The service could not read this image.", { status: res.status });
    throw new ApiError(
      detail || "Something went wrong on our side. Please try again in a moment.",
      { status: res.status }
    );
  }

  return normalize(await res.json());
}

/** Makes the response safe to render even if the backend changes slightly. */
export function normalize(data) {
  const all = data?.all_types && typeof data.all_types === "object" ? data.all_types : {};
  const entries = Object.entries(all)
    .map(([name, p]) => [name, Number(p) || 0])
    .sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) throw new ApiError("The service returned an unexpected answer.");

  const [topName, topProb] = entries[0];
  const top_type = data.top_type || topName;
  const confidence = typeof data.confidence === "number" ? data.confidence : topProb;
  const risk = data.risk === "high" || data.risk === "low" ? data.risk : riskOf(top_type);

  return { top_type, confidence, risk, all_types: Object.fromEntries(entries) };
}

// ---- Fake prediction (VITE_USE_MOCK=true) --------------------------------
// Picks a lesion from the file name/size so different photos give different
// results, which is handy for testing both the "low" and "high" layouts.
function mockPredict(file, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const seed = (file.size + file.name.length) % LESION_NAMES.length;
      const top = LESION_NAMES[seed];
      const rest = LESION_NAMES.filter((n) => n !== top);
      const weights = [0.12, 0.08, 0.06, 0.04, 0.03, 0.02];
      const topProb = 0.65;
      const all = { [top]: topProb };
      const scale = (1 - topProb) / weights.reduce((a, b) => a + b, 0);
      rest.forEach((n, i) => (all[n] = weights[i] * scale));
      resolve(normalize({ all_types: all }));
    }, 1600);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
