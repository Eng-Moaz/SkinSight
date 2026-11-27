// The 7 HAM10000 lesion types. Keys must match the names the prediction
// service returns in `top_type` and `all_types`.
// NOTE: descriptions are short placeholders; Salma will write the final
// explanations (week 7-9) and they can be pasted here.

export const LESIONS = {
  Melanoma: {
    risk: "high",
    description:
      "A serious type of skin cancer that develops from pigment-producing cells. Early detection matters a lot.",
  },
  "Basal cell carcinoma": {
    risk: "high",
    description:
      "The most common type of skin cancer. It grows slowly and rarely spreads, but needs treatment.",
  },
  "Actinic keratosis": {
    risk: "high",
    description:
      "A rough, scaly patch caused by years of sun exposure. It can develop into skin cancer if left untreated.",
  },
  "Melanocytic nevus": {
    risk: "low",
    description: "A common mole. Most moles are harmless, but changes in size, shape or colour should be checked.",
  },
  "Benign keratosis": {
    risk: "low",
    description: "A non-cancerous growth that often appears with age, sometimes called a 'seborrheic keratosis'.",
  },
  Dermatofibroma: {
    risk: "low",
    description: "A small, firm, harmless bump in the skin, often on the legs.",
  },
  "Vascular lesion": {
    risk: "low",
    description: "A lesion made of blood vessels, such as cherry angiomas. Usually harmless.",
  },
};

export const LESION_NAMES = Object.keys(LESIONS);

export function riskOf(typeName) {
  return LESIONS[typeName]?.risk ?? "high"; // unknown -> be cautious
}

// Display order used by the result page and the About page.
export const LESION_ORDER = [
  "Melanoma",
  "Melanocytic nevus",
  "Benign keratosis",
  "Basal cell carcinoma",
  "Actinic keratosis",
  "Dermatofibroma",
  "Vascular lesion",
];
