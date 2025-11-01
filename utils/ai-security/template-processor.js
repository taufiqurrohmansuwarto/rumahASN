// template-processor.js
/**
 * Template-based processing untuk menghindari PII dikirim ke AI
 *
 * KONSEP:
 * 1. AI generate template SEKALI dengan placeholder generik
 * 2. Template disimpan dan di-reuse untuk semua user
 * 3. Server fill placeholder dengan data real user
 *
 * KEUNTUNGAN:
 * - AI TIDAK pernah tahu PII user (nama, NIP, dll)
 * - Template bisa di-cache/reuse
 * - Lebih cepat (AI hanya dipakai sekali untuk generate template)
 * - Cost lebih murah (tidak perlu call AI per user)
 */

/**
 * Fill template dengan data user
 * @param {string} template - Template dengan placeholder {{variable}}
 * @param {Object} data - Data untuk fill placeholder
 * @returns {string} Template yang sudah di-fill
 *
 * @example
 * const template = "Halo {{nama}}, skor Anda {{skp}}";
 * const result = fillTemplate(template, { nama: "Budi", skp: 85 });
 * // "Halo Budi, skor Anda 85"
 */
const fillTemplate = (template, data) => {
  if (!template || typeof template !== "string") {
    throw new Error("Template must be a non-empty string");
  }

  if (!data || typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  let result = template;

  // Replace all {{key}} with data[key]
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");

    // Convert value to string, handle null/undefined
    const stringValue = value != null ? String(value) : "";
    result = result.replace(regex, stringValue);
  });

  return result;
};

/**
 * Fill nested template (support object/array dalam data)
 * @param {string} template - Template dengan placeholder
 * @param {Object} data - Data dengan nested structure
 * @returns {string} Template yang sudah di-fill
 *
 * @example
 * const template = "{{header.sapaan}}, kekuatan: {{snapshot.strengths.0}}";
 * const result = fillNestedTemplate(template, {
 *   header: { sapaan: "Halo Budi" },
 *   snapshot: { strengths: ["Teknis bagus"] }
 * });
 */
const fillNestedTemplate = (template, data) => {
  if (!template || typeof template !== "string") {
    throw new Error("Template must be a non-empty string");
  }

  let result = template;

  // Find all {{...}} patterns
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...template.matchAll(placeholderRegex)];

  matches.forEach(([fullMatch, path]) => {
    // Support nested path: header.sapaan atau array: strengths.0
    const value = getNestedValue(data, path.trim());
    const stringValue = value != null ? String(value) : "";
    result = result.replace(fullMatch, stringValue);
  });

  return result;
};

/**
 * Get nested value from object by path
 * @param {Object} obj - Source object
 * @param {string} path - Dot-separated path (e.g., "header.sapaan" or "items.0.name")
 * @returns {*} Value at path
 */
const getNestedValue = (obj, path) => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null) return undefined;
    result = result[key];
  }

  return result;
};

/**
 * Fill template dengan array data (batch processing)
 * @param {string} template - Template
 * @param {Array<Object>} dataArray - Array of data objects
 * @returns {Array<string>} Array of filled templates
 *
 * @example
 * const template = "{{nama}} skor {{skp}}";
 * const results = fillTemplateBatch(template, [
 *   { nama: "Budi", skp: 85 },
 *   { nama: "Ani", skp: 90 }
 * ]);
 * // ["Budi skor 85", "Ani skor 90"]
 */
const fillTemplateBatch = (template, dataArray) => {
  if (!Array.isArray(dataArray)) {
    throw new Error("Data must be an array");
  }

  return dataArray.map((data) => fillTemplate(template, data));
};

/**
 * Extract placeholders dari template
 * @param {string} template - Template string
 * @returns {Array<string>} Array of placeholder names
 *
 * @example
 * const placeholders = extractPlaceholders("Halo {{nama}}, skor {{skp}}");
 * // ["nama", "skp"]
 */
const extractPlaceholders = (template) => {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = [...template.matchAll(regex)];
  return matches.map(([, key]) => key.trim());
};

/**
 * Validate template: check if all required placeholders are present
 * @param {string} template - Template string
 * @param {Array<string>} requiredFields - Required field names
 * @returns {Object} { isValid: boolean, missing: string[] }
 *
 * @example
 * const validation = validateTemplate("Halo {{nama}}", ["nama", "skp"]);
 * // { isValid: false, missing: ["skp"] }
 */
const validateTemplate = (template, requiredFields) => {
  const placeholders = extractPlaceholders(template);
  const missing = requiredFields.filter((field) => !placeholders.includes(field));

  return {
    isValid: missing.length === 0,
    missing,
    found: placeholders,
  };
};

/**
 * Create safe template prompt untuk AI (tanpa PII)
 * @param {Object} profileSchema - Schema profil (tanpa data real)
 * @returns {string} Generic prompt untuk AI
 *
 * @example
 * const prompt = createSafePrompt({
 *   nama: "string",
 *   jabatan: "string",
 *   skp_score: "number"
 * });
 * // Prompt akan instruksikan AI untuk gunakan {{nama}}, {{jabatan}}, dll
 */
const createSafePrompt = (profileSchema) => {
  const placeholders = Object.keys(profileSchema)
    .map((key) => `{{${key}}}`)
    .join(", ");

  return `
INSTRUKSI TEMPLATE GENERATION:

Buat template insight/motivasi yang menggunakan PLACEHOLDER berikut:
${placeholders}

CRITICAL RULES:
1. JANGAN gunakan nama real, gunakan placeholder {{nama}}
2. JANGAN assume data spesifik, gunakan placeholder
3. Template harus generic dan bisa di-reuse untuk semua user
4. Output HARUS dalam format yang bisa di-fill nanti

CONTOH OUTPUT YANG BENAR:
"Halo {{nama}}, skor SKP Anda adalah {{skp_score}}. Kekuatan Anda: {{strength_1}}"

CONTOH OUTPUT YANG SALAH (JANGAN SEPERTI INI):
"Halo Budi, skor SKP Anda adalah 85" ❌ (PII hardcoded!)

Buat template sekarang:
`.trim();
};

module.exports = {
  fillTemplate,
  fillNestedTemplate,
  fillTemplateBatch,
  extractPlaceholders,
  validateTemplate,
  createSafePrompt,
};
