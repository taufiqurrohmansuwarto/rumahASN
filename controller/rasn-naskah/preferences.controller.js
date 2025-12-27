/**
 * Preferences Controller - RASN Naskah
 * Manage user preferences untuk gaya bahasa dan aturan custom
 */

const { handleError } = require("@/utils/helper/controller-helper");
const UserPreferences = require("@/models/rasn-naskah/user-preferences.model");

/**
 * Get user preferences
 */
const getPreferences = async (req, res) => {
  try {
    const { customId: userId } = req?.user;

    const preferences = await UserPreferences.getOrCreate(userId);

    res.json(preferences);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Update user preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const {
      language_style,
      custom_rules,
      forbidden_words,
      preferred_terms,
      atasan_nama,
      atasan_jabatan,
      signature_style,
      auto_check_spelling,
      auto_check_grammar,
    } = req?.body;

    const updateData = {};

    if (language_style !== undefined) updateData.language_style = language_style;
    if (custom_rules !== undefined) updateData.custom_rules = custom_rules;
    if (forbidden_words !== undefined) updateData.forbidden_words = forbidden_words;
    if (preferred_terms !== undefined) updateData.preferred_terms = preferred_terms;
    if (atasan_nama !== undefined) updateData.atasan_nama = atasan_nama;
    if (atasan_jabatan !== undefined) updateData.atasan_jabatan = atasan_jabatan;
    if (signature_style !== undefined) updateData.signature_style = signature_style;
    if (auto_check_spelling !== undefined)
      updateData.auto_check_spelling = auto_check_spelling;
    if (auto_check_grammar !== undefined)
      updateData.auto_check_grammar = auto_check_grammar;

    const preferences = await UserPreferences.updatePreferences(userId, updateData);

    res.json(preferences);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add custom rule
 */
const addCustomRule = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { name, description, severity, rule } = req?.body;

    // Support both old format (rule) and new format (name, description, severity)
    const ruleName = name || rule;
    if (!ruleName) {
      return res.status(400).json({ message: "Nama aturan wajib diisi" });
    }

    const preferences = await UserPreferences.getOrCreate(userId);
    const customRules = preferences.custom_rules || [];

    // Add new rule
    customRules.push({
      id: Date.now().toString(),
      name: ruleName,
      description: description || "",
      severity: severity || "warning",
      created_at: new Date().toISOString(),
    });

    const updated = await UserPreferences.updatePreferences(userId, {
      custom_rules: customRules,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove custom rule
 */
const removeCustomRule = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { ruleId } = req?.query;

    const preferences = await UserPreferences.getOrCreate(userId);
    const customRules = preferences.custom_rules || [];

    // Remove rule by id
    const updatedRules = customRules.filter((r) => r.id !== ruleId);

    const updated = await UserPreferences.updatePreferences(userId, {
      custom_rules: updatedRules,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add forbidden word
 */
const addForbiddenWord = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { word, replacement, reason } = req?.body;

    if (!word) {
      return res.status(400).json({ message: "Kata wajib diisi" });
    }

    const preferences = await UserPreferences.getOrCreate(userId);
    const forbiddenWords = preferences.forbidden_words || [];

    // Check if already exists
    const exists = forbiddenWords.some(
      (fw) => fw.word.toLowerCase() === word.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Kata sudah ada dalam daftar" });
    }

    // Add new word
    forbiddenWords.push({
      id: Date.now().toString(),
      word,
      replacement: replacement || null,
      reason: reason || null,
      created_at: new Date().toISOString(),
    });

    const updated = await UserPreferences.updatePreferences(userId, {
      forbidden_words: forbiddenWords,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove forbidden word
 */
const removeForbiddenWord = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { wordId } = req?.query;

    const preferences = await UserPreferences.getOrCreate(userId);
    const forbiddenWords = preferences.forbidden_words || [];

    // Remove word by id
    const updatedWords = forbiddenWords.filter((w) => w.id !== wordId);

    const updated = await UserPreferences.updatePreferences(userId, {
      forbidden_words: updatedWords,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Add preferred term
 */
const addPreferredTerm = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { original, preferred, context } = req?.body;

    if (!original || !preferred) {
      return res
        .status(400)
        .json({ message: "Istilah asli dan istilah yang disukai wajib diisi" });
    }

    const preferences = await UserPreferences.getOrCreate(userId);
    const preferredTerms = preferences.preferred_terms || [];

    // Check if already exists
    const exists = preferredTerms.some(
      (pt) => pt.original.toLowerCase() === original.toLowerCase()
    );

    if (exists) {
      return res.status(400).json({ message: "Istilah sudah ada dalam daftar" });
    }

    // Add new term
    preferredTerms.push({
      id: Date.now().toString(),
      original,
      preferred,
      context: context || null,
      created_at: new Date().toISOString(),
    });

    const updated = await UserPreferences.updatePreferences(userId, {
      preferred_terms: preferredTerms,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Remove preferred term
 */
const removePreferredTerm = async (req, res) => {
  try {
    const { customId: userId } = req?.user;
    const { termId } = req?.query;

    const preferences = await UserPreferences.getOrCreate(userId);
    const preferredTerms = preferences.preferred_terms || [];

    // Remove term by id
    const updatedTerms = preferredTerms.filter((t) => t.id !== termId);

    const updated = await UserPreferences.updatePreferences(userId, {
      preferred_terms: updatedTerms,
    });

    res.json(updated);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * Get language style options
 */
const getLanguageStyles = async (req, res) => {
  try {
    const styles = [
      {
        value: "formal",
        label: "Formal",
        description: "Sangat formal, cocok untuk surat ke atasan/pejabat tinggi",
      },
      {
        value: "semi_formal",
        label: "Semi Formal",
        description: "Semi formal, cocok untuk surat ke rekan sejawat",
      },
      {
        value: "standar",
        label: "Standar",
        description: "Gaya standar sesuai Pergub Tata Naskah Dinas",
      },
    ];

    res.json(styles);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
  addCustomRule,
  removeCustomRule,
  addForbiddenWord,
  removeForbiddenWord,
  addPreferredTerm,
  removePreferredTerm,
  getLanguageStyles,
};

