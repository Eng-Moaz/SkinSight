const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// Sends the photo to the prediction service.
// Returns { top_type, confidence, risk, all_types } or throws an Error with a user-friendly message.
export async function checkPhoto(file) {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Please choose a JPEG, PNG or WebP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("The image is too large (max 10 MB).");
  }

  const form = new FormData();
  form.append("file", file);

  let response;
  try {
    response = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
  } catch {
    throw new Error("Cannot reach the prediction service. Please try again later.");
  }

  if (!response.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      detail = (await response.json()).detail || detail;
    } catch {}
    throw new Error(detail);
  }
  return response.json();
}
