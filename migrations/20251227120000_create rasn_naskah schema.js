/**
 * Migration: Create RASN Naskah Schema and All Tables
 * Fitur SAKTI Naskah - AI-powered document review untuk naskah dinas ASN
 *
 * Tables:
 * 1. rasn_naskah.pergub - Pergub Tata Naskah Dinas
 * 2. rasn_naskah.pergub_rules - Aturan-aturan dari Pergub (untuk Qdrant)
 * 3. rasn_naskah.templates - Template naskah dinas
 * 4. rasn_naskah.user_preferences - Preferensi gaya bahasa user
 * 5. rasn_naskah.documents - Dokumen naskah utama
 * 6. rasn_naskah.document_versions - Versi/history dokumen
 * 7. rasn_naskah.document_reviews - Hasil review AI
 * 8. rasn_naskah.document_attachments - File lampiran dokumen
 * 9. rasn_naskah.review_issues - Detail issues dari review
 * 10. rasn_naskah.bookmarks - Naskah yang di-bookmark user
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.transaction(async (trx) => {
    // 1. Create schema rasn_naskah
    await trx.raw("CREATE SCHEMA IF NOT EXISTS rasn_naskah");

    // ============================================
    // REFERENSI & ADMIN TABLES
    // ============================================

    // 2. Create pergub table (Peraturan Gubernur Tata Naskah Dinas)
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("pergub", (table) => {
        table.string("id").primary();
        table.string("name").notNullable(); // Nama Pergub
        table.string("regulation_number").notNullable(); // Nomor Pergub (e.g., "No. 23 Tahun 2024")
        table.text("description"); // Deskripsi singkat
        table.string("file_url"); // URL file PDF Pergub
        table.boolean("is_active").defaultTo(true);
        table.date("effective_date").nullable(); // Tanggal mulai berlaku
        table.date("expired_date").nullable(); // Tanggal kadaluarsa (jika ada)
        table
          .string("created_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);

        // Index untuk pencarian
        table.index(["is_active"]);
        table.index(["regulation_number"]);
      });

    // 3. Create pergub_rules table (Aturan-aturan dari Pergub)
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("pergub_rules", (table) => {
        table.string("id").primary();
        table
          .string("pergub_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.pergub")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .enum("rule_type", [
            "format", // Aturan format dokumen
            "bahasa", // Aturan bahasa/tata bahasa
            "struktur", // Aturan struktur naskah
            "kop_surat", // Aturan kop surat
            "penomoran", // Aturan penomoran
            "tanda_tangan", // Aturan tanda tangan
            "lampiran", // Aturan lampiran
            "lainnya", // Aturan lainnya
          ])
          .notNullable();
        table.string("rule_title").notNullable(); // Judul aturan
        table.text("rule_content").notNullable(); // Isi aturan lengkap
        table.text("example").nullable(); // Contoh penerapan
        table.text("counter_example").nullable(); // Contoh yang salah
        table.integer("priority").defaultTo(0); // Prioritas aturan (0-100)
        table.string("qdrant_point_id").nullable(); // ID di Qdrant untuk vector search
        table.boolean("is_active").defaultTo(true);
        table.timestamps(true, true);

        // Indexes
        table.index(["pergub_id"]);
        table.index(["rule_type"]);
        table.index(["qdrant_point_id"]);
      });

    // ============================================
    // TEMPLATE TABLES
    // ============================================

    // 4. Create templates table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("templates", (table) => {
        table.string("id").primary();
        table.string("name").notNullable(); // Nama template
        table
          .enum("category", [
            "surat_dinas", // Surat Dinas
            "nota_dinas", // Nota Dinas
            "surat_keputusan", // Surat Keputusan
            "surat_edaran", // Surat Edaran
            "surat_tugas", // Surat Tugas
            "surat_undangan", // Surat Undangan
            "surat_perintah", // Surat Perintah
            "berita_acara", // Berita Acara
            "laporan", // Laporan
            "proposal", // Proposal
            "telaahan_staf", // Telaahan Staf
            "disposisi", // Disposisi
            "memo", // Memo
            "lainnya", // Lainnya
          ])
          .notNullable();
        table.text("description"); // Deskripsi template
        table.text("content").notNullable(); // Isi template (markdown/text)
        table.jsonb("structure").nullable(); // Struktur template dalam JSON
        table.jsonb("placeholders").nullable(); // Placeholder yang perlu diisi
        table.boolean("is_public").defaultTo(false); // Template publik atau pribadi
        table
          .string("created_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.integer("usage_count").defaultTo(0); // Berapa kali digunakan
        table.timestamps(true, true);

        // Indexes
        table.index(["category"]);
        table.index(["is_public"]);
        table.index(["created_by"]);
      });

    // ============================================
    // USER PREFERENCES
    // ============================================

    // 5. Create user_preferences table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("user_preferences", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .notNullable()
          .unique()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .enum("language_style", [
            "formal", // Sangat formal (untuk atasan/pejabat tinggi)
            "semi_formal", // Semi formal (untuk rekan sejawat)
            "standar", // Standar (default)
          ])
          .defaultTo("standar");
        table.jsonb("custom_rules").nullable(); // Aturan kustom user (JSON array)
        table.jsonb("forbidden_words").nullable(); // Kata-kata yang tidak boleh digunakan
        table.jsonb("preferred_terms").nullable(); // Istilah yang disukai (mapping)
        table.text("atasan_nama").nullable(); // Nama atasan untuk referensi
        table.text("atasan_jabatan").nullable(); // Jabatan atasan
        table.text("signature_style").nullable(); // Gaya tanda tangan
        table.boolean("auto_check_spelling").defaultTo(true); // Auto cek ejaan
        table.boolean("auto_check_grammar").defaultTo(true); // Auto cek tata bahasa
        table.timestamps(true, true);
      });

    // ============================================
    // DOCUMENT TABLES
    // ============================================

    // 6. Create documents table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("documents", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("template_id")
          .nullable()
          .references("id")
          .inTable("rasn_naskah.templates")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");
        table.string("title").notNullable(); // Judul dokumen
        table.text("content").nullable(); // Isi dokumen (text/markdown)
        table
          .enum("category", [
            "surat_dinas",
            "nota_dinas",
            "surat_keputusan",
            "surat_edaran",
            "surat_tugas",
            "surat_undangan",
            "surat_perintah",
            "berita_acara",
            "laporan",
            "proposal",
            "telaahan_staf",
            "disposisi",
            "memo",
            "lainnya",
          ])
          .nullable();
        table
          .enum("source_type", [
            "upload", // Upload file
            "text_input", // Input teks manual
            "voice_input", // Input suara (speech-to-text)
            "template", // Dari template
          ])
          .notNullable();
        table.string("original_file_url").nullable(); // URL file asli yang diupload
        table.string("original_file_name").nullable(); // Nama file asli
        table.string("original_file_type").nullable(); // Tipe file (pdf, docx, dll)
        table.integer("original_file_size").nullable(); // Ukuran file dalam bytes
        table.text("extracted_text").nullable(); // Teks hasil ekstraksi dari file
        table
          .enum("status", [
            "draft", // Draft, belum direview
            "pending_review", // Menunggu review AI (dalam queue)
            "reviewing", // Sedang direview AI
            "reviewed", // Sudah direview
            "revised", // Sudah direvisi
            "final", // Final/selesai
            "archived", // Diarsipkan
          ])
          .defaultTo("draft");
        table.float("latest_score").nullable(); // Skor review terakhir (0-100)
        table.integer("review_count").defaultTo(0); // Jumlah kali direview
        table.integer("revision_count").defaultTo(0); // Jumlah revisi
        table.string("qdrant_point_id").nullable(); // ID di Qdrant
        table.timestamps(true, true);

        // Indexes
        table.index(["user_id"]);
        table.index(["status"]);
        table.index(["category"]);
        table.index(["created_at"]);
      });

    // 7. Create document_versions table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("document_versions", (table) => {
        table.string("id").primary();
        table
          .string("document_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.documents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.integer("version_number").notNullable(); // Nomor versi (1, 2, 3, ...)
        table.text("content").notNullable(); // Isi dokumen pada versi ini
        table.text("change_summary").nullable(); // Ringkasan perubahan
        table.float("score").nullable(); // Skor pada versi ini
        table
          .string("created_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);

        // Unique constraint: 1 document hanya punya 1 version number
        table.unique(["document_id", "version_number"]);
        table.index(["document_id"]);
      });

    // ============================================
    // REVIEW TABLES
    // ============================================

    // 8. Create document_reviews table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("document_reviews", (table) => {
        table.string("id").primary();
        table
          .string("document_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.documents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("document_version_id")
          .nullable()
          .references("id")
          .inTable("rasn_naskah.document_versions")
          .onDelete("SET NULL")
          .onUpdate("CASCADE");
        table.text("original_content").notNullable(); // Konten yang direview
        table.text("ai_review").nullable(); // Review lengkap dari AI (markdown)
        table.text("ai_summary").nullable(); // Ringkasan review
        table.text("ai_suggestions").nullable(); // Saran perbaikan
        table.float("score").nullable(); // Skor review (0-100)
        table.jsonb("score_breakdown").nullable(); // Detail skor per kategori
        table.integer("total_issues").defaultTo(0); // Jumlah issues
        table.integer("critical_issues").defaultTo(0); // Issues kritis
        table.integer("major_issues").defaultTo(0); // Issues major
        table.integer("minor_issues").defaultTo(0); // Issues minor
        table.jsonb("matched_rules").nullable(); // Aturan Pergub yang relevan
        table
          .enum("status", [
            "pending", // Menunggu di queue
            "processing", // Sedang diproses
            "completed", // Selesai
            "failed", // Gagal
          ])
          .defaultTo("pending");
        table.string("job_id").nullable(); // Bull queue job ID
        table.text("error_message").nullable(); // Pesan error jika gagal
        table.integer("processing_time_ms").nullable(); // Waktu proses dalam ms
        table.timestamps(true, true);

        // Indexes
        table.index(["document_id"]);
        table.index(["status"]);
        table.index(["job_id"]);
        table.index(["created_at"]);
      });

    // 9. Create review_issues table (Detail issues dari review)
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("review_issues", (table) => {
        table.string("id").primary();
        table
          .string("review_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.document_reviews")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .enum("severity", [
            "critical", // Harus diperbaiki (kesalahan fatal)
            "major", // Sebaiknya diperbaiki (kesalahan penting)
            "minor", // Opsional diperbaiki (kesalahan kecil)
            "suggestion", // Saran perbaikan
          ])
          .notNullable();
        table
          .enum("category", [
            "format", // Masalah format
            "grammar", // Masalah tata bahasa
            "spelling", // Masalah ejaan
            "structure", // Masalah struktur
            "consistency", // Masalah konsistensi
            "terminology", // Masalah istilah
            "style", // Masalah gaya bahasa
            "regulation", // Tidak sesuai Pergub
            "other", // Lainnya
          ])
          .notNullable();
        table.text("issue_text").notNullable(); // Teks yang bermasalah
        table.text("description").notNullable(); // Penjelasan masalah
        table.text("suggestion").nullable(); // Saran perbaikan
        table.integer("line_number").nullable(); // Nomor baris (jika ada)
        table.integer("start_position").nullable(); // Posisi awal di teks
        table.integer("end_position").nullable(); // Posisi akhir di teks
        table
          .string("related_rule_id")
          .nullable()
          .references("id")
          .inTable("rasn_naskah.pergub_rules")
          .onDelete("SET NULL")
          .onUpdate("CASCADE"); // Aturan Pergub yang dilanggar
        table.boolean("is_resolved").defaultTo(false); // Sudah diperbaiki atau belum
        table.timestamps(true, true);

        // Indexes
        table.index(["review_id"]);
        table.index(["severity"]);
        table.index(["category"]);
        table.index(["is_resolved"]);
      });

    // ============================================
    // ATTACHMENT & BOOKMARK TABLES
    // ============================================

    // 10. Create document_attachments table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("document_attachments", (table) => {
        table.string("id").primary();
        table
          .string("document_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.documents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.string("file_name").notNullable();
        table.string("file_url").notNullable();
        table.string("file_type").nullable();
        table.integer("file_size").defaultTo(0);
        table
          .string("uploaded_by")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.timestamps(true, true);

        table.index(["document_id"]);
      });

    // 11. Create bookmarks table
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("bookmarks", (table) => {
        table.string("id").primary();
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("document_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.documents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table.text("note").nullable(); // Catatan user untuk bookmark
        table.timestamps(true, true);

        // Unique: 1 user hanya bisa bookmark 1 document 1x
        table.unique(["user_id", "document_id"]);
        table.index(["user_id"]);
      });

    // ============================================
    // HISTORY & ACTIVITY LOG
    // ============================================

    // 12. Create document_activities table (Activity log)
    await trx.schema
      .withSchema("rasn_naskah")
      .createTable("document_activities", (table) => {
        table.string("id").primary();
        table
          .string("document_id")
          .notNullable()
          .references("id")
          .inTable("rasn_naskah.documents")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .string("user_id")
          .notNullable()
          .references("custom_id")
          .inTable("public.users")
          .onDelete("CASCADE")
          .onUpdate("CASCADE");
        table
          .enum("action", [
            "created",
            "uploaded",
            "edited",
            "review_requested",
            "review_completed",
            "revised",
            "finalized",
            "archived",
            "bookmarked",
            "unbookmarked",
            "downloaded",
            "shared",
          ])
          .notNullable();
        table.jsonb("metadata").nullable(); // Data tambahan (old_value, new_value, dll)
        table.text("description").nullable(); // Deskripsi human-readable
        table.timestamps(true, true);

        table.index(["document_id", "created_at"]);
        table.index(["user_id"]);
      });

    // ============================================
    // FULLTEXT SEARCH INDEXES
    // ============================================

    // Index untuk pencarian dokumen
    await trx.raw(`
      CREATE INDEX idx_rasn_naskah_documents_search 
      ON rasn_naskah.documents 
      USING gin(to_tsvector('indonesian', coalesce(title, '') || ' ' || coalesce(content, '')))
    `);

    // Index untuk pencarian template
    await trx.raw(`
      CREATE INDEX idx_rasn_naskah_templates_search 
      ON rasn_naskah.templates 
      USING gin(to_tsvector('indonesian', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content, '')))
    `);

    // Index untuk pencarian aturan Pergub
    await trx.raw(`
      CREATE INDEX idx_rasn_naskah_pergub_rules_search 
      ON rasn_naskah.pergub_rules 
      USING gin(to_tsvector('indonesian', coalesce(rule_title, '') || ' ' || coalesce(rule_content, '')))
    `);

    // ============================================
    // SEED DATA: DEFAULT TEMPLATES
    // ============================================
    const { nanoid } = require("nanoid");

    await trx("rasn_naskah.templates").insert([
      {
        id: nanoid(),
        name: "Surat Dinas - Format Dasar",
        category: "surat_dinas",
        description:
          "Template surat dinas format standar sesuai Pergub Tata Naskah Dinas",
        content: `KOP SURAT RESMI

Nomor      : [nomor_surat]
Sifat      : [sifat_surat]
Lampiran   : [lampiran]
Hal        : [perihal]

Yth. [nama_tujuan]
       [jabatan_tujuan]
di
       [tempat]

[isi_surat]

Demikian surat ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.

                                                            [kota], [tanggal]
                                                            [jabatan_penandatangan]


                                                            [nama_penandatangan]
                                                            [NIP penandatangan]

Tembusan:
1. [tembusan_1]
2. [tembusan_2]`,
        structure: JSON.stringify({
          sections: [
            "kop_surat",
            "nomor_sifat_lampiran_hal",
            "tujuan",
            "isi",
            "penutup",
            "tanda_tangan",
            "tembusan",
          ],
        }),
        placeholders: JSON.stringify([
          "nomor_surat",
          "sifat_surat",
          "lampiran",
          "perihal",
          "nama_tujuan",
          "jabatan_tujuan",
          "tempat",
          "isi_surat",
          "kota",
          "tanggal",
          "jabatan_penandatangan",
          "nama_penandatangan",
          "NIP",
        ]),
        is_public: true,
        created_by: "master|56543",
        usage_count: 0,
      },
      {
        id: nanoid(),
        name: "Nota Dinas - Format Dasar",
        category: "nota_dinas",
        description: "Template nota dinas untuk komunikasi internal",
        content: `NOTA DINAS

Kepada     : [kepada]
Dari       : [dari]
Tanggal    : [tanggal]
Nomor      : [nomor]
Hal        : [hal]

[isi_nota_dinas]

Demikian nota dinas ini disampaikan untuk menjadi perhatian.

                                                            [jabatan]


                                                            [nama]
                                                            [NIP]`,
        structure: JSON.stringify({
          sections: [
            "header",
            "kepada_dari",
            "tanggal_nomor_hal",
            "isi",
            "penutup",
            "tanda_tangan",
          ],
        }),
        placeholders: JSON.stringify([
          "kepada",
          "dari",
          "tanggal",
          "nomor",
          "hal",
          "isi_nota_dinas",
          "jabatan",
          "nama",
          "NIP",
        ]),
        is_public: true,
        created_by: "master|56543",
        usage_count: 0,
      },
      {
        id: nanoid(),
        name: "Surat Tugas - Format Dasar",
        category: "surat_tugas",
        description: "Template surat tugas untuk penugasan pegawai",
        content: `KOP SURAT RESMI

SURAT TUGAS
Nomor: [nomor_surat_tugas]

Yang bertanda tangan di bawah ini:
Nama      : [nama_pemberi_tugas]
NIP       : [nip_pemberi_tugas]
Jabatan   : [jabatan_pemberi_tugas]

Memberikan tugas kepada:
Nama      : [nama_penerima_tugas]
NIP       : [nip_penerima_tugas]
Jabatan   : [jabatan_penerima_tugas]

Untuk:
[uraian_tugas]

Waktu pelaksanaan: [waktu_pelaksanaan]
Tempat           : [tempat_pelaksanaan]

Demikian surat tugas ini dibuat untuk dapat dilaksanakan dengan penuh tanggung jawab.

                                                            [kota], [tanggal]
                                                            [jabatan_penandatangan]


                                                            [nama_penandatangan]
                                                            [NIP penandatangan]`,
        structure: JSON.stringify({
          sections: [
            "kop_surat",
            "judul",
            "pemberi_tugas",
            "penerima_tugas",
            "uraian_tugas",
            "waktu_tempat",
            "penutup",
            "tanda_tangan",
          ],
        }),
        placeholders: JSON.stringify([
          "nomor_surat_tugas",
          "nama_pemberi_tugas",
          "nip_pemberi_tugas",
          "jabatan_pemberi_tugas",
          "nama_penerima_tugas",
          "nip_penerima_tugas",
          "jabatan_penerima_tugas",
          "uraian_tugas",
          "waktu_pelaksanaan",
          "tempat_pelaksanaan",
          "kota",
          "tanggal",
          "jabatan_penandatangan",
          "nama_penandatangan",
          "NIP",
        ]),
        is_public: true,
        created_by: "master|56543",
        usage_count: 0,
      },
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.transaction(async (trx) => {
    // Drop all tables in reverse order (karena foreign key dependencies)
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("document_activities");
    await trx.schema.withSchema("rasn_naskah").dropTableIfExists("bookmarks");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("document_attachments");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("review_issues");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("document_reviews");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("document_versions");
    await trx.schema.withSchema("rasn_naskah").dropTableIfExists("documents");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("user_preferences");
    await trx.schema.withSchema("rasn_naskah").dropTableIfExists("templates");
    await trx.schema
      .withSchema("rasn_naskah")
      .dropTableIfExists("pergub_rules");
    await trx.schema.withSchema("rasn_naskah").dropTableIfExists("pergub");

    // Drop schema
    await trx.raw("DROP SCHEMA IF EXISTS rasn_naskah CASCADE");
  });
};
