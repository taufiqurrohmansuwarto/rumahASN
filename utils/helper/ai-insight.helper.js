import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VECTOR_STORE_ID = "vs_69029aed95808191bd964a3d8086c471";

module.exports.insightAIForParuhWaktu = async (profile) => {
  try {
    const {
      nama = "",
      tempat_lahir = "",
      tgl_lahir = "",
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
                "Sapaan personal yang hangat dengan nama depan, acknowledge status PPPK paruh waktu dengan positif",
            },
            tagline: {
              type: "string",
              description:
                "Kalimat motivasi yang mengangkat semangat, spesifik untuk peran mereka",
            },
            ilustrasi_peran: {
              type: "string",
              description:
                "Deskripsi meaningful tentang kontribusi mereka di BKD meski paruh waktu",
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
                "Peluang yang bisa dimanfaatkan sebagai PPPK paruh waktu (network, skill, experience)",
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
            "Maksimal 3 referensi dokumen dari File Search yang relevan",
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
✅ MEMBERI SEMANGAT - status paruh waktu bukan halangan, ini adalah KESEMPATAN
✅ PRAKTIS & ACTIONABLE - mereka punya waktu terbatas, jadi setiap saran harus efisien
✅ FORWARD-LOOKING - bantu mereka lihat path ke depan (PPPK penuh/PNS/karir lain)
✅ BERBASIS DATA - gunakan dokumen dari File Search untuk validasi & referensi
✅ EMPATI TINGGI - acknowledge struggle mereka juggling paruh waktu dengan kehidupan lain
✅ SPESIFIK KE KONTEKS - selalu sebutkan unit kerja/instansi mereka yang SPESIFIK, bukan generik "BKD"

PENTING:
- WAJIB sebutkan unit kerja spesifik (misal: "Cabang Dinas Pendidikan Ponorogo", bukan cuma "BKD")
- Kontribusi harus digambarkan sesuai konteks unit kerja dan jabatan mereka
- Gunakan dokumen dari File Search untuk referensi (judul + URL) - maksimal 3 yang PALING relevan
- Jika tidak ada dokumen yang cocok, tetap berikan insight dari pengetahuan umum tentang PPPK
- Bahasa: hangat tapi tetap profesional, Indonesia yang natural
- Fokus pada STRENGTHS mereka dulu, baru area improvement
- Setiap insight harus jawab "So what?" - kenapa ini penting untuk MEREKA spesifik

TONE: Seperti kakak/senior yang supportive - peduli, jujur, optimis, praktis.
`.trim();

    const user = `
PROFIL PPPK PARUH WAKTU:

👤 IDENTITAS
Nama: ${nama}
TTL: ${tempat_lahir}, ${tgl_lahir}

🎓 PENDIDIKAN
${pendidikan_ijazah_nama}${tahun_lulus ? ` (Lulus ${tahun_lulus})` : ""}

💼 POSISI SAAT INI
Jabatan: ${nama_jabatan}
Unit Kerja: ${unor_nama}
Instansi: ${instansi_kerja_nama}
${golongan ? `Golongan: ${golongan}` : ""}
${eselon ? `Eselon: ${eselon}` : ""}

📅 STATUS KONTRAK
Periode: ${tgl_kontrak_mulai || "N/A"} s.d. ${tgl_kontrak_akhir || "N/A"}
Status: PPPK Paruh Waktu

---

INSTRUKSI OUTPUT (SINGKAT & PADAT):

1. HEADER (3 elemen)
   - Sapaan hangat yang acknowledge nama + status paruh waktu mereka dengan positif
   - Tagline motivasi yang spesifik untuk peran mereka DI UNIT KERJA MEREKA (sebutkan nama unit!)
   - Ilustrasi peran - tunjukkan kontribusi mereka meaningful DI UNIT/INSTANSI SPESIFIK mereka

2. SNAPSHOT (4 elemen)
   - Hitung masa kerja dari TMT (jika 0 atau sangat kecil, berarti baru bergabung)
   - Tentukan fase karir
   - Highlight 1 kekuatan utama dari background mereka yang RELEVAN dengan jabatan mereka
   - 1 area pengembangan prioritas (untuk jaga-jaga jika mau apply PPPK penuh/PNS)

3. DEEP INSIGHT (4 elemen)
   - Pola karir: dari pendidikan → posisi sekarang → kemana bisa berkembang DALAM KONTEKS jabatan & unit mereka
   - Peluang tersembunyi: apa yang bisa dimaksimalkan dari posisi paruh waktu DI UNIT KERJA INI (network, skill, portofolio, insider knowledge)
   - Red flag: hal yang perlu diperhatikan SPESIFIK untuk jabatan/unit mereka, sampaikan dengan empati
   - Next level: langkah konkret untuk upgrade (sebutkan jalur karir yang realistis untuk posisi mereka)

4. REFERENSI (maksimal 3)
   - Cari di File Search: regulasi PPPK, panduan karir, pelatihan yang relevan dengan JABATAN mereka
   - Hanya yang BENAR-BENAR relevan untuk user ini
   - Jika tidak ada yang cocok, skip bagian ini

5. CLOSING (2 elemen)
   - Motivasi personal: acknowledge bahwa paruh waktu challenging tapi valuable. WAJIB sebutkan unit kerja SPESIFIK mereka (contoh: "kontribusi Bapak di Cabang Dinas Pendidikan Ponorogo" BUKAN "di BKD")
   - 1 tips praktis yang bisa dilakukan dalam 1-7 hari ke depan, RELEVAN dengan jabatan mereka

KONTEKS KHUSUS PPPK PARUH WAKTU:
- Mereka punya waktu & energi terbatas → semua saran harus efisien
- Status kontrak → perlu jaga performa + prepare untuk future (renew/upgrade/exit plan)
- Mungkin masih explore karir → jangan push terlalu keras ke "jadi PNS", tapi tunjukkan opsi
- Butuh validasi → tunjukkan bahwa kontribusi mereka berharga DI UNIT KERJA MEREKA

PRINSIP: "Meski paruh waktu, dampak kamu bisa penuh - khususnya di ${unor_nama}." 💪

CRITICAL:
- SELALU sebutkan unit kerja spesifik (${unor_nama}), JANGAN cuma bilang "BKD" atau "instansi"
- Kontribusi digambarkan konkret sesuai jabatan (${nama_jabatan}) dan unit kerja mereka
- Ilustrasi peran harus relate dengan day-to-day mereka di posisi tersebut

Gunakan File Search untuk temukan dokumen yang relevan. Output HARUS ikuti JSON schema.
`.trim();

    const resp = await openai.responses.create({
      model: "gpt-3.5-turbo", // Model tertinggi untuk kualitas maksimal
      temperature: 0.5, // Sedikit lebih warm untuk tone yang hangat & personal

      tools: [{ type: "file_search", vector_store_ids: [VECTOR_STORE_ID] }],

      text: {
        format: {
          type: "json_schema",
          name: "asn_insight_premium",
          schema: schemaBody,
        },
      },

      input: [
        { role: "system", content: sys },
        { role: "user", content: [{ type: "input_text", text: user }] },
      ],

      metadata: {
        app: "rumah-asn",
        feature: "premium-insight-paruh-waktu",
        user_nama: nama,
      },
    });

    console.log(resp);
    const jsonText = resp.output_text;
    const insight = JSON.parse(jsonText);

    // Hitung masa kerja untuk metadata

    return {
      success: true,
      profile_summary: {
        nama,
        jabatan: nama_jabatan,
        unit: unor_nama,
        instansi: instansi_kerja_nama,
        status: "PPPK Paruh Waktu",
      },
      insight,
      metadata: {
        generated_at: new Date().toISOString(),
        response_id: resp.id,
        model: resp.model,
      },
    };
  } catch (e) {
    console.error("Error generating insight:", e);
    throw new Error(
      `Gagal membuat insight premium: ${e?.message || String(e)}`
    );
  }
};
