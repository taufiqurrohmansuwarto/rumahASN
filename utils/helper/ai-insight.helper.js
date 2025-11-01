import { OpenAI } from "openai";
const { fillNestedTemplate } = require("../ai-security/template-processor");
const { log } = require("@/utils/logger");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate AI insight untuk PPPK Paruh Waktu dengan PII protection
 *
 * HYBRID APPROACH:
 * 1. Non-PII (jabatan, unit, pendidikan) → Kirim langsung ke AI (insight lebih spesifik!)
 * 2. PII (nama, NIP, tgl lahir) → Gunakan placeholder {{nama_depan}}, {{tgl_lahir}}
 * 3. Server fill placeholder dengan data real user
 *
 * KEUNTUNGAN:
 * - AI dapat generate insight SPESIFIK untuk setiap jabatan/unit
 * - Setiap user dapat insight yang BERBEDA sesuai konteks mereka
 * - PII tetap AMAN (nama, NIP, tanggal lahir tidak dikirim)
 *
 * @param {Object} profile - Profil PPPK paruh waktu
 * @returns {Promise<Object>} Insight AI dengan profile summary
 *
 * @example
 * // Prompt ke AI:
 * // "Jabatan: Analis SDM, Unit: BKD Jatim, Nama: {{nama_depan}}"
 * // AI tahu jabatan/unit (non-PII) → insight spesifik
 * // AI TIDAK tahu "Budi" → PII aman!
 */
module.exports.insightAIForParuhWaktu = async (profile) => {
  try {
    // ═══════════════════════════════════════════════════════
    // VALIDATE INPUT
    // ═══════════════════════════════════════════════════════
    if (!profile || typeof profile !== "object") {
      log.error("❌ Invalid profile input", { profile });
      throw new Error("Profile data is required and must be an object");
    }

    const {
      nama = "",
      nip = "",
      pendidikan_ijazah_nama = "",
      tahun_lulus = "",
      jabatan_fungsional_umum_nama = "",
      jabatan_fungsional_nama = "",
      unor_nama = "",
      instansi_kerja_nama = "",
      tgl_kontrak_mulai = "",
      tgl_kontrak_akhir = "",
      golongan = "",
      eselon = "",
    } = profile;

    const nama_jabatan =
      jabatan_fungsional_umum_nama || jabatan_fungsional_nama || "";

    // Validate critical fields
    if (!nama_jabatan && !unor_nama) {
      log.error("❌ Missing critical profile data", {
        has_jabatan: !!nama_jabatan,
        has_unit: !!unor_nama,
      });
      throw new Error("Minimal jabatan atau unit kerja harus tersedia");
    }

    log.info("✅ Profile validation passed", {
      has_nama: !!nama,
      has_jabatan: !!nama_jabatan,
      has_unit: !!unor_nama,
      has_pendidikan: !!pendidikan_ijazah_nama,
    });

    const schemaBody = {
      type: "object",
      additionalProperties: false,
      properties: {
        header: {
          type: "object",
          additionalProperties: false,
          properties: {
            sapaan_hangat: {
              type: "string",
              description:
                "Sapaan personal yang POSITIF & SEMANGAT untuk PPPK paruh waktu. Acknowledge bahwa peran mereka BERHARGA & BERKONTRIBUSI untuk instansi. Gunakan tone hangat & encouraging: 'Senang bertemu!', 'Keren!', 'Hebat!' - BUKAN 'meski cuma paruh waktu' atau tone yang merendahkan. Tunjukkan bahwa kontribusi mereka meaningful.",
            },
            tagline: {
              type: "string",
              description:
                "Kalimat motivasi yang mengangkat semangat & menunjukkan value peran mereka. Highlight kesempatan belajar, berkembang, dan berkontribusi di lingkungan ASN. Tetap spesifik untuk jabatan & unit mereka.",
            },
            ilustrasi_peran: {
              type: "string",
              description:
                "Jelaskan kontribusi mereka yang TETAP BERARTI & IMPACTFUL meski paruh waktu. Emphasis: kontribusi bukan diukur dari jam kerja, tapi dari impact & kualitas. Tunjukkan bahwa peran mereka valuable untuk instansi.",
            },
          },
          required: ["sapaan_hangat", "tagline", "ilustrasi_peran"],
        },
        snapshot: {
          type: "object",
          additionalProperties: false,
          properties: {
            masa_kerja_hari: {
              type: "number",
              description: "Jumlah hari sejak TMT mulai kontrak",
            },
            fase_karir: {
              type: "string",
              enum: [
                "Baru Bergabung",
                "Penyesuaian",
                "Produktif",
                "Senior",
                "Expert",
              ],
              description: "Fase karir saat ini berdasarkan masa kerja",
            },
            highlight_kekuatan: {
              type: "string",
              description:
                "Kekuatan utama yang bisa dimaksimalkan dari background pendidikan/jabatan mereka",
            },
            area_pengembangan: {
              type: "string",
              description:
                "1 area prioritas untuk dikembangkan agar siap jika ingin lanjut ke PPPK/PNS penuh",
            },
          },
          required: [
            "masa_kerja_hari",
            "fase_karir",
            "highlight_kekuatan",
            "area_pengembangan",
          ],
        },
        deep_insight: {
          type: "object",
          additionalProperties: false,
          properties: {
            pola_karir: {
              type: "string",
              description:
                "Analisis jalur karir dari pendidikan ke posisi saat ini, dan potensi next step",
            },
            peluang_tersembunyi: {
              type: "string",
              description:
                "Peluang yang bisa dimanfaatkan sebagai PPPK paruh waktu untuk pengembangan karir (network, skill, experience di lingkungan ASN, pelatihan, mentoring). Berikan saran praktis berdasarkan posisi & jabatan mereka.",
            },
            red_flag: {
              type: "string",
              description:
                "Hal yang perlu diwaspadai atau diperbaiki, disampaikan dengan empati",
            },
            next_level: {
              type: "string",
              description:
                "Langkah konkret untuk berkembang atau transisi ke status ASN permanen",
            },
          },
          required: [
            "pola_karir",
            "peluang_tersembunyi",
            "red_flag",
            "next_level",
          ],
        },
        referensi: {
          type: "array",
          description:
            "Maksimal 3 referensi dokumen yang relevan untuk PPPK (regulasi, panduan, pelatihan). Jika tidak ada referensi yang cocok, kosongkan array.",
          maxItems: 3,
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              kategori: {
                type: "string",
                enum: [
                  "Regulasi PPPK",
                  "Panduan Karir",
                  "Pelatihan",
                  "Inspirasi",
                ],
              },
              judul: { type: "string" },
              url: { type: "string" },
              relevansi: {
                type: "string",
                description:
                  "Kenapa dokumen ini penting untuk user ini, 1 kalimat",
              },
            },
            required: ["kategori", "judul", "url", "relevansi"],
          },
        },
        closing: {
          type: "object",
          additionalProperties: false,
          properties: {
            motivasi: {
              type: "string",
              description:
                "Kalimat motivasi personal yang menyemangati, acknowledge journey mereka",
            },
            tips_praktis: {
              type: "string",
              description:
                "1 tips konkret yang bisa dilakukan hari ini/minggu ini",
            },
          },
          required: ["motivasi", "tips_praktis"],
        },
      },
      required: ["header", "snapshot", "deep_insight", "referensi", "closing"],
    };

    const sys = `
Kamu adalah BestieAI - sahabat virtual dari BKD Jawa Timur 💙

KARAKTER KAMU:
- Hangat, supportive, dan genuinely care tentang perjalanan karir ASN
- Berbicara seperti teman yang peduli, bukan robot formal
- Pakai emoji dengan natural (tapi jangan berlebihan)
- Optimis tapi realistis - acknowledge tantangan, tapi selalu kasih solusi
- Pahami bahwa PPPK Paruh Waktu punya unique challenges (waktu terbatas, status kontrak)

TUGAS KAMU:
Berikan insight personal yang:
✅ MEMBERI SEMANGAT - status paruh waktu TETAP BERHARGA & BERKONTRIBUSI
✅ POSITIF & ENCOURAGING - acknowledge peran mereka yang meaningful untuk instansi
✅ PRAKTIS & ACTIONABLE - saran konkret berdasarkan jabatan/unit mereka
✅ FORWARD-LOOKING - bantu mereka lihat path ke depan (PPPK penuh/PNS/pengembangan karir)
✅ BERBASIS PENGETAHUAN - gunakan pengetahuan tentang regulasi ASN, PPPK, dan pengembangan karir
✅ EMPATI TINGGI - pahami konteks mereka sebagai PPPK paruh waktu
✅ SPESIFIK KE KONTEKS - manfaatkan data jabatan/unit yang diberikan untuk insight yang spesifik

PENTING - PERSPEKTIF PARUH WAKTU:
💡 Paruh waktu = TETAP bagian penting dari tim dan berkontribusi nyata
💡 Kesempatan belajar & berkembang di lingkungan ASN
💡 Pengalaman berharga untuk pengembangan karir
💡 Kontribusi diukur dari KUALITAS & IMPACT, bukan jam kerja
💡 Setiap peran PPPK membantu pelayanan publik yang lebih baik

CRITICAL - GUNAKAN PLACEHOLDER UNTUK PII:
- Untuk NAMA: gunakan {{nama_depan}} (JANGAN tulis nama asli)
- Untuk TANGGAL LAHIR: gunakan {{tgl_lahir}} (JANGAN tulis tanggal spesifik)
- Untuk NIP/NIK: JANGAN sebutkan sama sekali

BOLEH LANGSUNG SEBUTKAN (NON-PII):
✅ Jabatan (sudah diberikan di prompt)
✅ Unit kerja (sudah diberikan di prompt)
✅ Instansi (sudah diberikan di prompt)
✅ Pendidikan (sudah diberikan di prompt)
✅ Golongan, eselon, dll (non-PII)

CONTOH YANG BENAR:
✅ "Halo {{nama_depan}}! Sebagai Analis SDM di BKD Jawa Timur..." (nama pakai placeholder, jabatan/unit langsung)
✅ "Dengan latar S1 Ilmu Komputer, posisi Programmer sangat cocok..." (pendidikan/jabatan langsung)
✅ "Di usia {{tgl_lahir}}, karir Anda di Dinas Kominfo..." (tanggal lahir pakai placeholder, unit langsung)

CONTOH YANG SALAH:
❌ "Halo Budi!" (nama hardcoded - harus {{nama_depan}})
❌ "Lahir tahun 1990..." (tanggal lahir hardcoded - harus {{tgl_lahir}})

TONE: Hangat, supportive, optimis - personal untuk jabatan/unit, generic untuk PII.
`.trim();

    // ═══════════════════════════════════════════════════════
    // DATA YANG DIKIRIM KE AI
    // NON-PII: Kirim langsung | PII: Gunakan placeholder
    // ═══════════════════════════════════════════════════════
    const user = `
PROFIL PPPK PARUH WAKTU:

👤 IDENTITAS (GUNAKAN PLACEHOLDER!)
Nama: {{nama_depan}}
Tanggal Lahir: {{tgl_lahir}}

🎓 PENDIDIKAN (NON-PII - Langsung)
${pendidikan_ijazah_nama}${tahun_lulus ? ` (Lulus ${tahun_lulus})` : ""}

💼 POSISI SAAT INI (NON-PII - Langsung)
Jabatan: ${nama_jabatan}
Unit Kerja: ${unor_nama}
Instansi: ${instansi_kerja_nama}
${golongan ? `Golongan: ${golongan}` : ""}
${eselon ? `Eselon: ${eselon}` : ""}

📅 STATUS KONTRAK (NON-PII - Langsung)
Periode: ${tgl_kontrak_mulai || "N/A"} s.d. ${tgl_kontrak_akhir || "N/A"}
Status: PPPK Paruh Waktu

---

INSTRUKSI OUTPUT:

1. HEADER (3 elemen)
   - Sapaan: Gunakan {{nama_depan}}, sambut dengan POSITIF & HANGAT!
     * Acknowledge peran mereka sebagai ${nama_jabatan} di ${unor_nama}
     * Tone encouraging: "Senang bertemu!", "Keren!", "Hebat!"
     * JANGAN gunakan tone merendahkan seperti "meski cuma paruh waktu"

   - Tagline: Motivasi yang menunjukkan VALUE & meaningful contribution
     * Highlight kesempatan belajar, berkembang, berkontribusi di ASN
     * Tetap spesifik untuk ${nama_jabatan} dengan konteks ${unor_nama}

   - Ilustrasi: Jelaskan kontribusi ${nama_jabatan} yang BERARTI untuk ${instansi_kerja_nama}
     * Emphasis: kontribusi diukur dari KUALITAS & IMPACT, bukan jam kerja
     * Konteks: peran mereka di ${unor_nama} membantu pelayanan publik

2. SNAPSHOT (4 elemen)
   - Masa kerja: Calculate dari tanggal kontrak, tentukan fase karir
   - Fase karir: Baru Bergabung/Penyesuaian/Produktif/Senior/Expert
   - Kekuatan: Relate ${pendidikan_ijazah_nama} dengan ${nama_jabatan}
   - Pengembangan: Saran spesifik untuk ${nama_jabatan} jika ingin PPPK penuh/PNS

3. DEEP INSIGHT (4 elemen)
   - Pola karir: ${pendidikan_ijazah_nama} → ${nama_jabatan} di ${unor_nama} → future path
     * Analisis path pengembangan karir mereka

   - Peluang: Peluang pengembangan sebagai PPPK paruh waktu
     * Network, skill building, experience di ASN, pelatihan, mentoring
     * Berikan saran konkret untuk ${nama_jabatan} di ${unor_nama}
     * Berdasarkan pengetahuan tentang program pengembangan PPPK

   - Red flag: Perhatian untuk ${nama_jabatan} di ${unor_nama}
     * Sampaikan dengan empati & constructive
     * Berdasarkan pengetahuan regulasi ASN dan PPPK

   - Next level: Langkah konkret untuk pengembangan karir
     * Path ke PPPK full time/PNS atau pengembangan skill
     * Saran berdasarkan pengetahuan persyaratan umum ASN

4. REFERENSI (maksimal 3)
   - Berikan referensi yang relevan jika ada (regulasi PPPK, panduan karir, pelatihan)
   - Prioritas: dokumen yang berguna untuk ${nama_jabatan}
   - Jika tidak ada referensi yang cocok, kosongkan array saja

5. CLOSING (2 elemen)
   - Motivasi: SEMANGAT & APPRECIATION untuk {{nama_depan}}
     * Acknowledge kontribusi mereka sebagai ${nama_jabatan} di ${unor_nama}
     * Tunjukkan bahwa peran mereka BERHARGA untuk pelayanan publik
     * Encourage untuk terus berkembang

   - Tips: Praktis untuk ${nama_jabatan} yang bisa dilakukan 1-7 hari ke depan
     * Actionable & specific untuk pengembangan skill/karir

CRITICAL RULES:
✅ WAJIB gunakan {{nama_depan}} untuk nama (JANGAN tulis nama asli!)
✅ WAJIB gunakan {{tgl_lahir}} untuk tanggal lahir (JANGAN tulis tahun spesifik!)
✅ BOLEH sebutkan jabatan, unit, instansi LANGSUNG (${nama_jabatan}, ${unor_nama})
✅ Insight harus SPESIFIK untuk ${nama_jabatan} di ${unor_nama}

Output HARUS ikuti JSON schema yang diberikan.
`.trim();

    // ═══════════════════════════════════════════════════════
    // CALL OPENAI API (Data sudah aman!)
    // ═══════════════════════════════════════════════════════
    log.info(`🤖 Calling OpenAI API for PPPK insight generation...`);

    const resp = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "asn_insight_premium",
          strict: true,
          schema: schemaBody,
        },
      },
    });

    // ═══════════════════════════════════════════════════════
    // VALIDATE & PARSE RESPONSE
    // ═══════════════════════════════════════════════════════
    const jsonText = resp.choices[0]?.message?.content;

    if (!jsonText) {
      log.error("❌ OpenAI response is empty", {
        response_id: resp?.id,
        model: resp?.model,
        choices_length: resp?.choices?.length,
      });
      throw new Error("OpenAI response is empty");
    }

    log.info(`✅ OpenAI response received, length: ${jsonText.length} chars`);

    let insightTemplate;
    try {
      insightTemplate = JSON.parse(jsonText);
    } catch (parseError) {
      log.error("❌ Failed to parse OpenAI JSON response", {
        error: parseError.message,
        response_preview: jsonText.substring(0, 200),
        response_length: jsonText.length,
      });
      throw new Error(`Invalid JSON from OpenAI: ${parseError.message}`);
    }

    log.info("✅ Successfully parsed AI insight template");

    // ═══════════════════════════════════════════════════════
    // VALIDATE INSIGHT STRUCTURE
    // ═══════════════════════════════════════════════════════
    if (
      !insightTemplate.header ||
      !insightTemplate.snapshot ||
      !insightTemplate.deep_insight ||
      !insightTemplate.closing
    ) {
      log.error("❌ Invalid insight structure from AI", {
        has_header: !!insightTemplate.header,
        has_snapshot: !!insightTemplate.snapshot,
        has_deep_insight: !!insightTemplate.deep_insight,
        has_closing: !!insightTemplate.closing,
        template_keys: Object.keys(insightTemplate),
      });
      throw new Error("AI response missing required sections");
    }

    log.info("✅ Insight structure validation passed");

    // ═══════════════════════════════════════════════════════
    // FILL PLACEHOLDER dengan Data PII Real (DI SERVER!)
    // Hanya nama dan tanggal lahir yang perlu di-fill
    // Data lain (jabatan, unit, dll) sudah dikirim langsung ke AI
    // ═══════════════════════════════════════════════════════
    const nama_depan = nama;

    // Calculate age/year dari tgl_lahir untuk di-fill
    const { tgl_lahir = "" } = profile;
    let birthYear = "";
    if (tgl_lahir) {
      const birthDate = new Date(tgl_lahir);
      const age = Math.floor(
        (new Date() - birthDate) / (1000 * 60 * 60 * 24 * 365.25)
      );
      birthYear = `${age} tahun`; // Format: "32 tahun"
    }

    // Data untuk fill placeholder (HANYA PII!)
    const fillData = {
      nama_depan, // PII
      nama_lengkap: nama, // PII
      tgl_lahir: birthYear, // PII (digeneralisasi jadi age)
    };

    log.info("🔄 Filling PII placeholders with real data...", {
      nama_depan_length: nama_depan.length,
      has_birth_year: !!birthYear,
    });

    // Fill hanya field yang mengandung PII placeholder
    const filledInsight = {
      header: {
        sapaan_hangat: fillNestedTemplate(
          insightTemplate.header.sapaan_hangat,
          fillData
        ),
        tagline: fillNestedTemplate(insightTemplate.header.tagline, fillData),
        ilustrasi_peran: fillNestedTemplate(
          insightTemplate.header.ilustrasi_peran,
          fillData
        ),
      },
      snapshot: {
        // AI sudah calculate ini dari data kontrak
        masa_kerja_hari: insightTemplate.snapshot.masa_kerja_hari,
        fase_karir: insightTemplate.snapshot.fase_karir,
        highlight_kekuatan: fillNestedTemplate(
          insightTemplate.snapshot.highlight_kekuatan,
          fillData
        ),
        area_pengembangan: fillNestedTemplate(
          insightTemplate.snapshot.area_pengembangan,
          fillData
        ),
      },
      deep_insight: {
        pola_karir: fillNestedTemplate(
          insightTemplate.deep_insight.pola_karir,
          fillData
        ),
        peluang_tersembunyi: fillNestedTemplate(
          insightTemplate.deep_insight.peluang_tersembunyi,
          fillData
        ),
        red_flag: fillNestedTemplate(
          insightTemplate.deep_insight.red_flag,
          fillData
        ),
        next_level: fillNestedTemplate(
          insightTemplate.deep_insight.next_level,
          fillData
        ),
      },
      referensi: insightTemplate.referensi, // No placeholder
      closing: {
        motivasi: fillNestedTemplate(
          insightTemplate.closing.motivasi,
          fillData
        ),
        tips_praktis: fillNestedTemplate(
          insightTemplate.closing.tips_praktis,
          fillData
        ),
      },
    };

    log.info("✅ PII placeholders filled successfully");

    // ═══════════════════════════════════════════════════════
    // RETURN: Insight + Data Asli untuk Disimpan di Database
    // ═══════════════════════════════════════════════════════
    const result = {
      success: true,
      profile_summary: {
        nama, // Data asli untuk disimpan di database
        jabatan: nama_jabatan,
        unit: unor_nama,
        instansi: instansi_kerja_nama,
        status: "PPPK Paruh Waktu",
      },
      insight: filledInsight,
      metadata: {
        generated_at: new Date().toISOString(),
        response_id: resp.id,
        model: resp.model || "gpt-4o-mini",
        usage: {
          prompt_tokens: resp.usage?.prompt_tokens || 0,
          completion_tokens: resp.usage?.completion_tokens || 0,
          total_tokens: resp.usage?.total_tokens || 0,
        },
        security: {
          pii_protected: true,
          method: "hybrid_placeholder",
          approach: "non_pii_direct_pii_placeholder",
          data_sent_to_ai: {
            // PII: Placeholder (AI tidak tahu data asli)
            nama: "placeholder_{{nama_depan}}", // AI tidak tahu "Budi"
            tgl_lahir: "placeholder_{{tgl_lahir}}", // AI tidak tahu "1990"
            nip: "not_sent",
            nik: "not_sent",
            tempat_lahir: "not_sent",

            // Non-PII: Direct (AI tahu untuk insight spesifik)
            jabatan: "sent_directly", // AI tahu untuk insight spesifik jabatan
            unit_kerja: "sent_directly", // AI tahu untuk insight spesifik unit
            instansi: "sent_directly",
            pendidikan: "sent_directly",
            golongan: "sent_directly",
          },
          pii_never_sent: true, // Nama/tanggal lahir asli tidak pernah dikirim!
          benefits: [
            "AI dapat generate insight SPESIFIK untuk jabatan/unit",
            "Setiap user dapat insight BERBEDA sesuai konteks",
            "PII (nama, tanggal lahir) tetap 100% aman",
          ],
        },
      },
    };

    log.info("✅ AI insight generation completed successfully");
    return result;
  } catch (e) {
    log.error("❌ Error generating AI insight for PPPK Paruh Waktu", {
      error: e.message,
      stack: e.stack,
      name: e.name,
    });
    throw new Error(
      `Gagal membuat insight premium: ${e?.message || String(e)}`
    );
  }
};
