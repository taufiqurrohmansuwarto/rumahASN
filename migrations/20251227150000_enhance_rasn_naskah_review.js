/**
 * Migration: Enhance RASN Naskah Review Structure
 *
 * Perubahan:
 * 1. Tambah kolom di review_issues untuk original_text dan suggested_text
 * 2. Tambah tabel superior_preferences untuk preferensi gaya bahasa atasan
 * 3. Tambah kolom target_superior_id di document_reviews
 * 4. Tambah kolom ai_suggestions_structured di document_reviews (JSONB)
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // ============================================
    // 1. ENHANCE REVIEW_ISSUES TABLE
    // ============================================
    await trx.schema.withSchema("rasn_naskah").alterTable("review_issues", (table) => {
      // Teks asli yang bermasalah (untuk tombol Copy)
      table.text("original_text").nullable();

      // Teks yang disarankan sebagai pengganti (untuk tombol Copy)
      table.text("suggested_text").nullable();

      // Referensi aturan dalam format readable (e.g., "Pergub Tata Naskah: ...")
      table.text("rule_reference").nullable();

      // Konteks tambahan untuk issue (baris sebelum/sesudah)
      table.text("context_before").nullable();
      table.text("context_after").nullable();

      // Flag apakah suggestion bisa langsung di-apply
      table.boolean("is_auto_fixable").defaultTo(false);
    });

    // ============================================
    // 2. CREATE SUPERIOR_PREFERENCES TABLE
    // ============================================
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("superior_preferences", (table) => {
        table.string("id").primary();

        // User yang menambahkan preferensi atasan
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");

        // Nama atasan (tidak perlu reference ke users karena bisa atasan eksternal)
        table.string("superior_name").notNullable();

        // Jabatan atasan
        table.string("superior_position").nullable();

        // Gaya bahasa yang disukai atasan
        table
          .enum("language_style", [
            "sangat_formal",     // Sangat formal, kaku
            "formal",            // Formal standar
            "semi_formal",       // Semi formal, sedikit fleksibel
            "ringkas",           // Prefer kalimat singkat dan to the point
          ])
          .defaultTo("formal");

        // Catatan khusus tentang preferensi atasan
        table.text("notes").nullable();

        // Contoh kalimat yang disukai atasan (untuk referensi AI)
        table.jsonb("preferred_phrases").nullable();

        // Kata/frasa yang tidak disukai atasan
        table.jsonb("disliked_phrases").nullable();

        // Panjang paragraf yang disukai (short, medium, long)
        table.enum("paragraph_length", ["short", "medium", "long"]).defaultTo("medium");

        // Apakah aktif digunakan
        table.boolean("is_active").defaultTo(true);

        // Urutan tampil (untuk multiple superiors)
        table.integer("display_order").defaultTo(0);

        table.timestamps(true, true);

        // Indexes
        table.index(["user_id"]);
        table.index(["is_active"]);
      });

    // ============================================
    // 3. ENHANCE DOCUMENT_REVIEWS TABLE
    // ============================================
    await trx.schema.withSchema("rasn_naskah").alterTable("document_reviews", (table) => {
      // Target atasan yang dipilih untuk review (opsional)
      table
        .string("target_superior_id")
        .nullable()
        .references("id")
        .inTable("rasn_naskah.superior_preferences")
        .onDelete("SET NULL")
        .onUpdate("CASCADE");

      // Suggestions dalam format terstruktur (untuk UI yang lebih baik)
      // Format: [{ category, original, suggested, reason, rule_ref }]
      table.jsonb("ai_suggestions_structured").nullable();

      // Saran khusus berdasarkan gaya bahasa atasan
      table.jsonb("superior_style_suggestions").nullable();

      // Flag apakah review sudah include analisis gaya atasan
      table.boolean("includes_superior_analysis").defaultTo(false);
    });

    // ============================================
    // 4. ADD INDEXES FOR PERFORMANCE
    // ============================================
    await trx.raw(`
      CREATE INDEX IF NOT EXISTS idx_review_issues_auto_fixable
      ON rasn_naskah.review_issues (is_auto_fixable)
      WHERE is_auto_fixable = true
    `);

    await trx.raw(`
      CREATE INDEX IF NOT EXISTS idx_document_reviews_target_superior
      ON rasn_naskah.document_reviews (target_superior_id)
      WHERE target_superior_id IS NOT NULL
    `);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    // Drop indexes first
    await trx.raw(`DROP INDEX IF EXISTS rasn_naskah.idx_review_issues_auto_fixable`);
    await trx.raw(`DROP INDEX IF EXISTS rasn_naskah.idx_document_reviews_target_superior`);

    // Remove columns from document_reviews
    await trx.schema.withSchema("rasn_naskah").alterTable("document_reviews", (table) => {
      table.dropColumn("target_superior_id");
      table.dropColumn("ai_suggestions_structured");
      table.dropColumn("superior_style_suggestions");
      table.dropColumn("includes_superior_analysis");
    });

    // Drop superior_preferences table
    await trx.schema.withSchema("rasn_naskah").dropTableIfExists("superior_preferences");

    // Remove columns from review_issues
    await trx.schema.withSchema("rasn_naskah").alterTable("review_issues", (table) => {
      table.dropColumn("original_text");
      table.dropColumn("suggested_text");
      table.dropColumn("rule_reference");
      table.dropColumn("context_before");
      table.dropColumn("context_after");
      table.dropColumn("is_auto_fixable");
    });
  });
};
