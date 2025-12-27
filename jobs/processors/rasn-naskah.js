/**
 * RASN Naskah Document Review Processor
 *
 * Processor ini bertanggung jawab untuk:
 * 1. Review dokumen dengan AI menggunakan OpenAI
 * 2. Mencari aturan yang relevan dari Qdrant
 * 3. Menyimpan hasil review ke database
 * 4. Sync rules ke Qdrant untuk semantic search
 */

const {
  Documents,
  DocumentReviews,
  ReviewIssues,
  PergubRules,
  DocumentActivities,
  SuperiorPreferences,
} = require("@/models/rasn-naskah");

const UserPreferences = require("@/models/rasn-naskah/user-preferences.model");

const {
  searchSimilar,
  upsertVector,
  batchUpsert,
} = require("@/utils/services/qdrant-naskah.services");

const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding using OpenAI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid text for embedding");
    }

    // Preprocess text
    const processedText = text.trim().replace(/\s+/g, " ").substring(0, 8000);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: processedText,
      dimensions: 3072,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error.message);
    throw error;
  }
};

/**
 * Main processor untuk document review
 * Enhanced version with user preferences and superior preferences support
 */
const processDocumentReview = async (job) => {
  const { documentId, reviewId, ...jobOptions } = job.data;
  // Support both nested options and flat options format
  const options = jobOptions.options || jobOptions;
  const { targetSuperiorId, targetUserId } = options;
  const startTime = Date.now();

  console.log(`📝 [RASN-NASKAH] Starting document review: ${documentId}`);
  console.log(`📝 [RASN-NASKAH] Options:`, { targetUserId, targetSuperiorId });

  try {
    // 1. Get document
    const document = await Documents.query()
      .findById(documentId)
      .withGraphFetched("[attachments, user]");

    if (!document) {
      throw new Error(`Document not found: ${documentId}`);
    }

    // 2. Get target preferences (user preferences or superior preferences)
    let targetSuperior = null;
    let targetUserPrefs = null;
    let targetContext = null;

    // Priority: targetUserId (new) > targetSuperiorId (legacy)
    if (targetUserId) {
      targetUserPrefs = await UserPreferences.query()
        .where("user_id", targetUserId)
        .withGraphFetched("user(simpleWithImage)")
        .first();

      if (targetUserPrefs) {
        targetContext = targetUserPrefs.generateAIContext?.() || null;
        console.log(
          `📋 [RASN-NASKAH] Using user preferences: ${
            targetUserPrefs.user?.username || targetUserId
          }`
        );
      }
    } else if (targetSuperiorId) {
      targetSuperior = await SuperiorPreferences.query().findById(
        targetSuperiorId
      );
      console.log(
        `📋 [RASN-NASKAH] Using superior preferences: ${
          targetSuperior?.superior_name || "Not found"
        }`
      );
    }

    // 3. Update review status to processing
    await DocumentReviews.query()
      .findById(reviewId)
      .patch({
        status: "processing",
        target_superior_id: targetSuperiorId || null,
      });

    job.progress(10);

    // 4. Get document content
    const content = document.content || document.extracted_text || "";
    if (!content.trim()) {
      throw new Error("Document has no content to review");
    }

    job.progress(20);

    // 5. Search for relevant rules from Qdrant
    const relevantRules = await searchRelevantRules(
      content,
      document.category || document.document_type
    );
    job.progress(40);

    // 6. Generate AI review with user/superior context
    const reviewOptions = {
      ...options,
      targetSuperior,
      targetUserPrefs,
      targetContext,
    };
    const reviewResult = await generateDocumentReview(
      content,
      relevantRules,
      document,
      reviewOptions
    );
    job.progress(70);

    // 7. Save issues to database
    const issues = await saveReviewIssues(reviewId, reviewResult.issues);
    job.progress(85);

    // 8. Update review with results (including new structured fields)
    const processingTime = Date.now() - startTime;

    // Count issues by severity
    const criticalIssues = issues.filter(
      (i) => i.severity === "critical"
    ).length;
    const majorIssues = issues.filter((i) => i.severity === "major").length;
    const minorIssues = issues.filter((i) => i.severity === "minor").length;
    const suggestionIssues = issues.filter(
      (i) => i.severity === "suggestion"
    ).length;

    await DocumentReviews.query()
      .findById(reviewId)
      .patch({
        status: "completed",
        score: reviewResult.overallScore,
        ai_review: reviewResult.fullReview,
        ai_summary: reviewResult.summary,
        ai_suggestions: reviewResult.recommendations?.join("\n") || null,
        // New structured fields
        ai_suggestions_structured: reviewResult.aiSuggestionsStructured || null,
        superior_style_suggestions:
          reviewResult.superiorStyleSuggestions || null,
        includes_superior_analysis:
          reviewResult.includesSuperiorAnalysis || false,
        // Existing fields
        score_breakdown: reviewResult.scoreBreakdown,
        total_issues: issues.length,
        critical_issues: criticalIssues,
        major_issues: majorIssues,
        minor_issues: minorIssues + suggestionIssues, // Include suggestions in minor count
        matched_rules: reviewResult.matchedRules || null,
        processing_time_ms: processingTime,
      });

    // 9. Update document status
    await Documents.query().findById(documentId).patch({
      status: "reviewed",
      latest_score: reviewResult.overallScore,
      updated_at: new Date().toISOString(),
    });

    // 10. Log activity
    const targetName =
      targetUserPrefs?.user?.username || targetSuperior?.superior_name || null;
    await DocumentActivities.log(
      documentId,
      document.user_id,
      "review_completed",
      {
        review_id: reviewId,
        score: reviewResult.overallScore,
        issues_count: issues.length,
        target_user: targetUserPrefs?.user?.username || null,
        target_superior: targetSuperior?.superior_name || null,
      },
      `Dokumen direview dengan skor ${reviewResult.overallScore}${
        targetName ? ` (untuk ${targetName})` : ""
      }`
    );

    job.progress(100);

    console.log(
      `✅ [RASN-NASKAH] Document review completed: ${documentId}, Score: ${reviewResult.overallScore}`
    );

    return {
      documentId,
      reviewId,
      overallScore: reviewResult.overallScore,
      issuesCount: issues.length,
      processingTime,
      targetUser: targetUserPrefs?.user?.username || null,
      targetSuperior: targetSuperior?.superior_name || null,
    };
  } catch (error) {
    console.error(
      `❌ [RASN-NASKAH] Document review failed: ${documentId}`,
      error.message
    );

    // Update review status to failed
    await DocumentReviews.query().findById(reviewId).patch({
      status: "failed",
      error_message: error.message,
    });

    // Update document status back
    await Documents.query().findById(documentId).patch({
      status: "draft",
      updated_at: new Date().toISOString(),
    });

    throw error;
  }
};

/**
 * Search for relevant rules from Qdrant
 */
const searchRelevantRules = async (content, documentType) => {
  try {
    // Generate embedding for document content
    const contentChunks = chunkText(content, 2000);
    const allRules = [];

    for (const chunk of contentChunks.slice(0, 3)) {
      // Limit to first 3 chunks
      const embedding = await generateEmbedding(chunk);

      // Search for similar rules
      const results = await searchSimilar(embedding, {
        limit: 10,
        scoreThreshold: 0.5,
        filter: {
          must: [{ key: "is_active", match: { value: true } }],
        },
      });

      if (results && results.length > 0) {
        allRules.push(...results);
      }
    }

    // Deduplicate rules by ID
    const uniqueRules = [];
    const seenIds = new Set();
    for (const rule of allRules) {
      if (!seenIds.has(rule.id)) {
        seenIds.add(rule.id);
        uniqueRules.push(rule);
      }
    }

    // Sort by score and take top 15
    uniqueRules.sort((a, b) => b.score - a.score);
    return uniqueRules.slice(0, 15);
  } catch (error) {
    console.warn("Failed to search relevant rules:", error.message);
    return [];
  }
};

/**
 * Generate document review using OpenAI
 * Enhanced version with structured suggestions for better UI display
 * Supports both user preferences (new) and superior preferences (legacy)
 */
const generateDocumentReview = async (
  content,
  relevantRules,
  document,
  options
) => {
  const { targetSuperior, targetUserPrefs, targetContext } = options;

  const rulesContext = relevantRules
    .map((rule) => {
      const payload = rule.payload || {};
      return `- [${payload.rule_type || "General"}] ${payload.title || ""}: ${
        payload.content || ""
      } (Sumber: ${payload.source || "Aturan umum"})`;
    })
    .join("\n");

  // Build target preferences context
  // Priority: targetContext (from user preferences) > targetSuperior (legacy)
  let preferencesContext = "";
  const hasUserPrefs = targetContext || targetUserPrefs;
  const hasSuperiorPrefs = targetSuperior;

  if (hasUserPrefs) {
    const userName = targetUserPrefs?.user?.username || "Target User";
    const languageStyle = targetUserPrefs?.language_style || "standar";

    // Build comprehensive context even if minimal preferences
    const styleDescriptions = {
      formal_lengkap:
        "SANGAT FORMAL dengan kalimat detail, panjang, dan komprehensif. Gunakan banyak kata penghubung, kalimat majemuk, dan penjelasan lengkap.",
      formal_ringkas:
        "FORMAL tapi RINGKAS. Langsung ke pokok permasalahan, hindari kalimat bertele-tele, gunakan kalimat pendek dan efektif.",
      semi_formal:
        "SEMI-FORMAL, lebih fleksibel tapi tetap sopan. Boleh sedikit lebih santai dalam pemilihan kata.",
      formal: "FORMAL standar sesuai kaidah tata naskah dinas.",
      standar: "STANDAR sesuai Pergub Tata Naskah Dinas.",
    };

    preferencesContext = `

=== PREFERENSI PENERIMA NASKAH: ${userName} ===

GAYA BAHASA YANG DIINGINKAN:
${styleDescriptions[languageStyle] || "Gaya standar"}

${targetContext ? `PREFERENSI & ATURAN KHUSUS:\n${targetContext}` : ""}

=== INSTRUKSI WAJIB UNTUK ANALISIS PREFERENSI ===

1. CEK GAYA BAHASA:
   - Analisis SETIAP paragraf/kalimat apakah sudah sesuai dengan gaya "${languageStyle}"
   - Jika gaya "formal_ringkas" - tandai kalimat yang terlalu panjang/bertele-tele
   - Jika gaya "formal_lengkap" - tandai bagian yang terlalu singkat dan perlu diperluas

2. CEK ATURAN KHUSUS (WAJIB DILAPORKAN):
   - Periksa SETIAP aturan khusus yang disebutkan di atas
   - Jika ada aturan "Selalu letakkan PIC / Kontak" → CEK apakah ada nomor telepon/email/kontak di dokumen
   - Jika aturan TIDAK terpenuhi → WAJIB masukkan ke "issues" dengan severity "major" atau "critical"
   - Jika aturan terpenuhi → sebutkan di "overall_note"

3. CEK KATA/FRASA TERLARANG:
   - Cari semua kata/frasa yang ada di daftar "KATA/FRASA YANG DILARANG"
   - Setiap kata terlarang yang ditemukan WAJIB dilaporkan sebagai issue
   - Berikan saran pengganti sesuai yang ditentukan

4. CEK ISTILAH YANG HARUS DIGANTI:
   - Cari semua istilah yang ada di daftar "ISTILAH YANG HARUS DIGANTI"
   - Setiap istilah yang ditemukan WAJIB dilaporkan dengan saran penggantinya

5. LAPORAN HASIL:
   - Berikan minimal 3-5 saran spesifik di "target_style_feedback"
   - Untuk setiap saran, WAJIB berikan contoh SEBELUM dan SESUDAH
   - Jika dokumen sudah memenuhi semua aturan, sebutkan secara eksplisit

PENTING: Jangan abaikan aturan khusus! Setiap aturan harus dicek dan dilaporkan hasilnya.`;
  } else if (hasSuperiorPrefs) {
    preferencesContext = `

PREFERENSI ATASAN TUJUAN:
${
  targetSuperior.generateAIContext
    ? targetSuperior.generateAIContext()
    : `
- Nama: ${targetSuperior.superior_name}
- Jabatan: ${targetSuperior.superior_position || "-"}
- Gaya Bahasa: ${targetSuperior.language_style || "formal"}
- Catatan: ${targetSuperior.notes || "-"}
`
}

Berikan juga saran khusus berdasarkan preferensi atasan di atas.`;
  }

  const systemPrompt = `Anda adalah asisten ahli penulisan naskah dinas yang bertugas mereview dokumen resmi pemerintahan Indonesia.
Tugas Anda adalah menganalisis dokumen dan memberikan feedback berdasarkan aturan tata naskah dinas.

Aturan yang relevan untuk dokumen ini:
${
  rulesContext ||
  "Tidak ada aturan khusus ditemukan, gunakan aturan umum tata naskah dinas."
}
${preferencesContext}

PENTING: Untuk setiap temuan, Anda HARUS menyertakan:
1. "original_text" - teks asli yang bermasalah (copy exact dari dokumen)
2. "suggested_text" - teks yang disarankan sebagai pengganti
3. "rule_reference" - referensi aturan yang dilanggar (jika ada)

Berikan review dalam format JSON yang valid dengan struktur berikut:
{
  "overallScore": 0-100,
  "summary": "Ringkasan review dalam 2-3 kalimat, sebutkan jumlah temuan perbaikan.",
  "scoreBreakdown": {
    "grammar": 0-100,
    "spelling": 0-100,
    "structure": 0-100,
    "formatting": 0-100,
    "terminology": 0-100
  },
  "issues": [
    {
      "category": "format|grammar|spelling|style|structure|terminology|consistency|regulation",
      "severity": "critical|major|minor|suggestion",
      "original_text": "teks asli yang bermasalah (copy exact)",
      "suggested_text": "teks yang disarankan sebagai pengganti",
      "description": "Penjelasan singkat mengapa ini bermasalah",
      "rule_reference": "Referensi aturan, contoh: Pergub Tata Naskah: Naskah resmi wajib cantumkan dasar hukum",
      "is_auto_fixable": true/false
    }
  ],
  "suggestions_structured": [
    {
      "category": "format|penulisan|saran",
      "original": "teks asli",
      "suggested": "teks yang disarankan",
      "reason": "alasan singkat"
    }
  ],
  "recommendations": [
    "Rekomendasi umum untuk perbaikan dokumen"
  ]${
    hasUserPrefs || hasSuperiorPrefs
      ? `,
  "target_style_feedback": {
    "is_compliant": true/false,
    "compliance_score": 0-100,
    "target_name": "${
      hasUserPrefs
        ? targetUserPrefs?.user?.username || "Target User"
        : targetSuperior?.superior_name || "Atasan"
    }",
    "style_requested": "${targetUserPrefs?.language_style || "standar"}",
    "custom_rules_check": [
      {
        "rule": "Nama aturan khusus",
        "status": "terpenuhi|tidak_terpenuhi|sebagian",
        "detail": "Penjelasan status aturan ini",
        "found_in_document": "Kutipan dari dokumen yang membuktikan (jika terpenuhi)",
        "missing_element": "Apa yang kurang/tidak ada (jika tidak terpenuhi)"
      }
    ],
    "forbidden_words_found": [
      {
        "word": "kata terlarang yang ditemukan",
        "location": "konteks dimana kata ditemukan",
        "replacement": "kata pengganti yang disarankan"
      }
    ],
    "terms_to_replace": [
      {
        "original": "istilah yang ditemukan",
        "preferred": "istilah yang seharusnya digunakan",
        "location": "konteks dimana istilah ditemukan"
      }
    ],
    "suggestions": [
      {
        "issue": "Deskripsi masalah gaya bahasa yang SPESIFIK",
        "original_sentence": "Kalimat asli dari dokumen yang perlu diubah",
        "suggested_sentence": "Kalimat yang sudah diperbaiki sesuai gaya bahasa target",
        "suggestion": "Penjelasan mengapa perubahan ini diperlukan"
      }
    ],
    "style_analysis": {
      "sentence_length": "Analisis panjang kalimat (terlalu panjang/pendek/sesuai)",
      "formality_level": "Analisis tingkat formalitas (kurang formal/terlalu formal/sesuai)",
      "word_choice": "Analisis pemilihan kata",
      "overall_tone": "Analisis nada keseluruhan dokumen"
    },
    "overall_note": "Ringkasan komprehensif. Sebutkan status SEMUA aturan khusus, kata terlarang, dan istilah yang harus diganti. Minimal 3-4 kalimat."
  }`
      : ""
  }
}

Kategori severity:
- critical: Kesalahan fatal yang HARUS diperbaiki (misal: tidak ada dasar hukum, format salah total)
- major: Kesalahan penting yang SEBAIKNYA diperbaiki (misal: tata bahasa salah)
- minor: Kesalahan kecil (misal: typo, spasi berlebih)
- suggestion: Saran peningkatan (misal: istilah yang lebih tepat)

Kategori issues:
- format: Masalah format dokumen (kop, margin, font)
- grammar: Masalah tata bahasa
- spelling: Masalah ejaan
- style: Masalah gaya penulisan
- structure: Masalah struktur naskah
- terminology: Masalah istilah resmi
- consistency: Masalah konsistensi
- regulation: Tidak sesuai Pergub`;

  const userPrompt = `Review dokumen naskah dinas berikut:

Jenis Dokumen: ${
    document.category || document.document_type || "Tidak diketahui"
  }
Judul: ${document.title || "Tidak ada judul"}
Nomor: ${document.document_number || "-"}

Konten Dokumen:
---
${content.substring(0, 12000)}
---

Berikan review komprehensif dengan memperhatikan:
1. Tata bahasa dan ejaan (sesuai KBBI dan PUEBI)
2. Struktur dokumen (kop surat, pembukaan, isi, penutup)
3. Format penulisan (margin, font, spasi)
4. Istilah resmi dan baku
5. Konsistensi penulisan
6. Dasar hukum (untuk surat resmi)

PENTING: Untuk setiap temuan, WAJIB sertakan original_text dan suggested_text yang bisa di-copy.

Pastikan output dalam format JSON yang valid.`;

  try {
    // Use gpt-4o for better quality when analyzing preferences, otherwise gpt-4o-mini
    const useAdvancedModel = hasUserPrefs || hasSuperiorPrefs;
    const modelToUse = useAdvancedModel ? "gpt-4o" : "gpt-4o-mini";

    console.log(
      `🤖 [RASN-NASKAH] Using model: ${modelToUse} (preferences: ${useAdvancedModel})`
    );

    const response = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: useAdvancedModel ? 0.4 : 0.3, // Slightly higher for more creative suggestions
      max_tokens: useAdvancedModel ? 8000 : 6000,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    // Map AI severity to database severity (jika masih pakai format lama)
    const mapSeverity = (severity) => {
      const mapping = {
        error: "critical",
        warning: "major",
        info: "minor",
        suggestion: "suggestion",
        // New format already uses correct values
        critical: "critical",
        major: "major",
        minor: "minor",
      };
      return mapping[severity] || "minor";
    };

    // Transform issues with mapped severity and ensure required fields
    const transformedIssues = (result.issues || []).map((issue) => ({
      ...issue,
      severity: mapSeverity(issue.severity),
      original_text: issue.original_text || issue.context || "",
      suggested_text: issue.suggested_text || issue.suggestion || "",
      rule_reference: issue.rule_reference || issue.ruleReference || null,
      is_auto_fixable: issue.is_auto_fixable || false,
    }));

    // Generate full review text
    const fullReview = `## Hasil Review Dokumen\n\n**Skor: ${
      result.overallScore || 0
    }/100**\n\n${result.summary || ""}\n\n### Breakdown Skor\n${Object.entries(
      result.scoreBreakdown || {}
    )
      .map(([key, value]) => `- ${key}: ${value}/100`)
      .join("\n")}\n\n### Rekomendasi\n${(result.recommendations || [])
      .map((r) => `- ${r}`)
      .join("\n")}`;

    // Build ai_suggestions_structured for UI
    const aiSuggestionsStructured = (
      result.suggestions_structured || transformedIssues
    ).map((item) => ({
      category: item.category || "other",
      original: item.original || item.original_text || "",
      suggested: item.suggested || item.suggested_text || "",
      reason: item.reason || item.description || "",
      severity: item.severity,
      rule_reference: item.rule_reference,
    }));

    // Handle both new (target_style_feedback) and legacy (superior_style_feedback) format
    const styleFeedback =
      result.target_style_feedback || result.superior_style_feedback || null;

    return {
      overallScore: result.overallScore || 0,
      summary: result.summary || "",
      fullReview,
      scoreBreakdown: result.scoreBreakdown || {},
      issues: transformedIssues,
      aiSuggestionsStructured,
      superiorStyleSuggestions: styleFeedback,
      includesSuperiorAnalysis: !!(hasUserPrefs || hasSuperiorPrefs),
      recommendations: result.recommendations || [],
      matchedRules: relevantRules.map((r) => r.payload?.id || r.id),
    };
  } catch (error) {
    console.error("Failed to generate review:", error.message);

    // Return default result on error
    return {
      overallScore: 0,
      summary: "Gagal memproses review dokumen",
      fullReview:
        "## Review Gagal\n\nTerjadi kesalahan saat memproses review dokumen.",
      scoreBreakdown: {},
      issues: [],
      aiSuggestionsStructured: [],
      superiorStyleSuggestions: null,
      includesSuperiorAnalysis: false,
      recommendations: ["Silakan coba lagi nanti"],
      matchedRules: [],
    };
  }
};

/**
 * Save review issues to database
 * Enhanced version with original_text, suggested_text, and rule_reference
 */
const saveReviewIssues = async (reviewId, issues) => {
  const savedIssues = [];

  // Map AI categories to database categories
  const mapCategory = (category) => {
    const mapping = {
      grammar: "grammar",
      spelling: "spelling",
      punctuation: "grammar", // No punctuation in DB, map to grammar
      style: "style",
      structure: "structure",
      formatting: "format",
      format: "format",
      terminology: "terminology",
      consistency: "consistency",
      regulation: "regulation",
      penulisan: "grammar", // Map UI category to DB
      saran: "other",
    };
    return mapping[category] || "other";
  };

  for (const issue of issues) {
    try {
      const savedIssue = await ReviewIssues.query().insert({
        review_id: reviewId,
        category: mapCategory(issue.category),
        severity: issue.severity || "minor",
        // New fields for better UI display
        original_text: issue.original_text || issue.context || "",
        suggested_text: issue.suggested_text || issue.suggestion || "",
        rule_reference: issue.rule_reference || null,
        is_auto_fixable: issue.is_auto_fixable || false,
        // Legacy fields (still populated for backwards compatibility)
        issue_text:
          issue.original_text ||
          issue.context ||
          issue.message?.substring(0, 500) ||
          "Tidak ada konteks",
        description:
          issue.description || issue.message || "Tidak ada deskripsi",
        suggestion: issue.suggested_text || issue.suggestion || null,
        line_number: issue.lineNumber || issue.line_number || null,
        start_position: issue.positionStart || issue.start_position || null,
        end_position: issue.positionEnd || issue.end_position || null,
        is_resolved: false,
      });
      savedIssues.push(savedIssue);
    } catch (error) {
      console.warn("Failed to save issue:", error.message);
    }
  }

  return savedIssues;
};

/**
 * Processor untuk sync rules ke Qdrant
 */
const processSyncRulesToQdrant = async (job) => {
  const { pergubId, force } = job.data;
  const startTime = Date.now();

  console.log(
    `🔄 [RASN-NASKAH] Starting sync rules to Qdrant: ${pergubId || "all"}`
  );

  try {
    // Get rules to sync
    let rulesQuery = PergubRules.query()
      .where("is_active", true)
      .withGraphFetched("pergub");

    if (pergubId) {
      rulesQuery = rulesQuery.where("pergub_id", pergubId);
    }

    // Only sync rules without embedding unless forced
    if (!force) {
      rulesQuery = rulesQuery.whereNull("embedding_id");
    }

    const rules = await rulesQuery;

    if (rules.length === 0) {
      console.log("No rules to sync");
      return { synced: 0, failed: 0 };
    }

    job.progress(10);

    let synced = 0;
    let failed = 0;
    const batchSize = 10;

    for (let i = 0; i < rules.length; i += batchSize) {
      const batch = rules.slice(i, i + batchSize);
      const vectors = [];

      for (const rule of batch) {
        try {
          // Generate embedding for rule content
          const textToEmbed = `${rule.title || ""}\n${rule.content || ""}`;
          const embedding = await generateEmbedding(textToEmbed);

          vectors.push({
            id: rule.id,
            vector: embedding,
            payload: {
              rule_id: rule.id,
              pergub_id: rule.pergub_id,
              title: rule.title,
              content: rule.content,
              rule_type: rule.rule_type,
              category: rule.category,
              source: rule.pergub?.number || "Unknown",
              is_active: true,
            },
          });

          synced++;
        } catch (error) {
          console.warn(`Failed to embed rule ${rule.id}:`, error.message);
          failed++;
        }
      }

      // Batch upsert to Qdrant
      if (vectors.length > 0) {
        try {
          await batchUpsert(vectors);

          // Update embedding_id in database
          for (const vector of vectors) {
            await PergubRules.query().findById(vector.id).patch({
              embedding_id: vector.id,
              embedded_at: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error("Failed to upsert batch to Qdrant:", error.message);
          failed += vectors.length;
          synced -= vectors.length;
        }
      }

      // Update progress
      const progress = Math.min(90, Math.round((i / rules.length) * 80) + 10);
      job.progress(progress);
    }

    job.progress(100);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [RASN-NASKAH] Sync rules completed: ${synced} synced, ${failed} failed, ${duration}ms`
    );

    return { synced, failed, duration };
  } catch (error) {
    console.error(`❌ [RASN-NASKAH] Sync rules failed:`, error.message);
    throw error;
  }
};

/**
 * Helper function to chunk text
 */
const chunkText = (text, maxLength = 2000) => {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += (currentChunk ? " " : "") + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

/**
 * Format markdown content using AI
 * Background job version with enhanced prompt
 */
const processFormatMarkdown = async (job) => {
  const { documentId, rawContent, filename } = job.data;
  const startTime = Date.now();

  console.log(
    `📝 [RASN-NASKAH] Starting format markdown for document: ${documentId}`
  );

  try {
    // Update document status to formatting
    await Documents.query().findById(documentId).patch({
      content_status: "formatting",
    });

    job.progress(10);

    // Enhanced AI formatting prompt
    const formattedContent = await formatMarkdownWithAI(rawContent, filename);

    job.progress(80);

    // Update document with formatted content
    await Documents.query().findById(documentId).patch({
      content: formattedContent,
      content_status: "ready",
      updated_at: new Date().toISOString(),
    });

    // Update document version if exists
    const DocumentVersions = require("@/models/rasn-naskah/document-versions.model");
    const latestVersion = await DocumentVersions.query()
      .where("document_id", documentId)
      .orderBy("version_number", "desc")
      .first();

    if (latestVersion) {
      await DocumentVersions.query().findById(latestVersion.id).patch({
        content: formattedContent,
      });
    }

    job.progress(100);

    const duration = Date.now() - startTime;
    console.log(
      `✅ [RASN-NASKAH] Format markdown completed: ${documentId}, duration: ${duration}ms`
    );

    return {
      documentId,
      success: true,
      duration,
      contentLength: formattedContent?.length || 0,
    };
  } catch (error) {
    console.error(
      `❌ [RASN-NASKAH] Format markdown failed: ${documentId}`,
      error.message
    );

    // Update document status to failed, but keep original content
    await Documents.query().findById(documentId).patch({
      content_status: "failed",
      content: rawContent, // Fallback to raw content
    });

    throw error;
  }
};

/**
 * Format markdown using OpenAI with enhanced prompt
 */
const formatMarkdownWithAI = async (rawContent, filename) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Anda adalah asisten yang bertugas merapikan format markdown dari hasil ekstraksi dokumen naskah dinas Indonesia.

TUGAS UTAMA:
1. Perbaiki struktur heading dengan tepat:
   - # untuk judul dokumen utama (SURAT DINAS, NOTA DINAS, dll)
   - ## untuk bagian utama (PERIHAL, DASAR, ISI, dll)
   - ### untuk sub-bagian

2. Format bagian kop surat dengan rapi:
   - Nama instansi, alamat, telepon dalam format yang terstruktur
   - Nomor surat, tanggal, perihal sebagai metadata yang jelas

3. Perbaiki format paragraf:
   - Gabungkan baris yang terputus akibat ekstraksi
   - Buat paragraf yang koheren dan mudah dibaca
   - Jaga jarak antar paragraf

4. Format list dan numbering:
   - Gunakan numbered list untuk poin berurutan
   - Gunakan bullet list untuk poin tidak berurutan
   - Format dasar hukum dengan baik

5. Tabel:
   - Jika ada data tabular, format sebagai tabel markdown
   - Header tabel harus jelas

6. Bagian tanda tangan:
   - Format nama, jabatan, NIP dengan rapi
   - Pisahkan dengan jelas dari isi surat

7. Pembersihan:
   - Hapus karakter aneh atau whitespace berlebih
   - Jaga konsistensi spasi dan indentasi
   - Perbaiki typo ejaan umum jika ditemukan

PENTING:
- JANGAN mengubah isi/makna konten
- JANGAN menambah atau mengurangi informasi
- Output harus markdown valid yang mudah dibaca
- Fokus pada FORMATTING bukan EDITING konten`,
        },
        {
          role: "user",
          content: `Rapikan format markdown dari dokumen "${filename}" berikut:\n\n${rawContent.substring(
            0,
            20000
          )}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 10000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Failed to format markdown with AI:", error.message);
    return rawContent; // Return original if AI fails
  }
};

module.exports = {
  processDocumentReview,
  processSyncRulesToQdrant,
  processFormatMarkdown,
};
