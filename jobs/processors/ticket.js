/**
 * Ticket AI Processor
 * Memproses ticket untuk mendapatkan ringkasan AI dan rekomendasi jawaban
 * Menambahkan comment dari BestieAI dan mengirim notifikasi ke user
 */

const Tickets = require("@/models/tickets.model");
const User = require("@/models/users.model");
const TicketsCommentsCustomers = require("@/models/tickets_comments_customers.model");
const Notifications = require("@/models/notifications.model");
const {
  generateSummary,
  getTicketRecommendation,
} = require("@/services/ticket-ai.services");

// BestieAI Bot ID
const BESTIE_AI_BOT_ID = "bot|bestie-ai-001";

/**
 * PII (Personally Identifiable Information) Filter
 * Menyensor informasi sensitif seperti NIP, NIK, KK, nomor HP, email, dll
 */
const PII_PATTERNS = [
  // NIP (18 digit) - format: 199103052019031008
  {
    regex: /\b(\d{8})\s*(\d{6})\s*(\d{1})\s*(\d{3})\b/g,
    replacement: "[NIP disembunyikan]",
    name: "NIP",
  },
  // NIP dengan spasi/titik - format: 19910305 201903 1 008
  {
    regex: /\b\d{8}\s*\d{6}\s*\d\s*\d{3}\b/g,
    replacement: "[NIP disembunyikan]",
    name: "NIP spasi",
  },
  // NIK (16 digit) - format: 3578012345678901
  {
    regex: /\b\d{16}\b/g,
    replacement: "[NIK disembunyikan]",
    name: "NIK",
  },
  // Nomor KK (16 digit) - biasanya sama format dengan NIK
  {
    regex: /\b(kk|kartu\s*keluarga)[:\s]*\d{16}\b/gi,
    replacement: "[No. KK disembunyikan]",
    name: "KK",
  },
  // Nomor HP Indonesia (08xx, 62xx) - 10-13 digit
  {
    regex: /\b(0|62|\+62)\s*8\d{2}[\s.-]?\d{3,4}[\s.-]?\d{3,4}\b/g,
    replacement: "[No. HP disembunyikan]",
    name: "HP",
  },
  // Email
  {
    regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[Email disembunyikan]",
    name: "Email",
  },
  // Nomor rekening bank (10-16 digit)
  {
    regex: /\b(rekening|rek|no\.?\s*rek)[:\s]*\d{10,16}\b/gi,
    replacement: "[No. Rekening disembunyikan]",
    name: "Rekening",
  },
  // NPWP (15 digit dengan format xx.xxx.xxx.x-xxx.xxx)
  {
    regex: /\b\d{2}[.\s]?\d{3}[.\s]?\d{3}[.\s]?\d[.\s]?[-]?\d{3}[.\s]?\d{3}\b/g,
    replacement: "[NPWP disembunyikan]",
    name: "NPWP",
  },
  // Nomor paspor (A1234567)
  {
    regex: /\b(paspor|passport)[:\s]*[A-Z]\d{7}\b/gi,
    replacement: "[No. Paspor disembunyikan]",
    name: "Paspor",
  },
  // Tanggal lahir lengkap (DD-MM-YYYY atau DD/MM/YYYY)
  {
    regex:
      /\b(lahir|tgl\s*lahir|tanggal\s*lahir)[:\s]*\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/gi,
    replacement: "[Tanggal lahir disembunyikan]",
    name: "Tanggal lahir",
  },
  // Alamat lengkap (Jl., Jalan, RT, RW, Desa, Kelurahan, Kecamatan)
  {
    regex:
      /\b(jl\.?|jalan)\s+[A-Za-z0-9\s.,]+(?:no\.?\s*\d+)?(?:\s*rt\.?\s*\d+)?(?:\s*rw\.?\s*\d+)?/gi,
    replacement: "[Alamat disembunyikan]",
    name: "Alamat",
  },
  // Nama lengkap yang disebutkan secara eksplisit (nama: xxx, a.n. xxx)
  {
    regex: /\b(nama\s*lengkap|a\.?n\.?|atas\s*nama)[:\s]+[A-Z][a-zA-Z\s.,]+/gi,
    replacement: "[Nama disembunyikan]",
    name: "Nama eksplisit",
  },
];

/**
 * Filter PII dari text
 * @param {string} text - Text yang akan difilter
 * @returns {string} - Text yang sudah difilter
 */
const filterPII = (text) => {
  if (!text) return text;

  let filteredText = text;
  let piiFound = [];

  for (const pattern of PII_PATTERNS) {
    const matches = filteredText.match(pattern.regex);
    if (matches && matches.length > 0) {
      piiFound.push({ type: pattern.name, count: matches.length });
      filteredText = filteredText.replace(pattern.regex, pattern.replacement);
    }
  }

  if (piiFound.length > 0) {
    console.log(
      `🔒 [PII FILTER] Filtered PII:`,
      piiFound.map((p) => `${p.type}(${p.count})`).join(", ")
    );
  }

  return filteredText;
};

/**
 * Format ringkasan dengan markdown yang lebih structured
 * Termasuk filter PII untuk keamanan data
 */
const formatSummaryComment = (userName, summary) => {
  // Filter PII dari summary sebelum ditampilkan
  const filteredSummary = filterPII(summary);
  const greetings = [
    `Hai **${userName}**! 😊`,
    `Halo **${userName}**! 👋`,
    `Selamat datang **${userName}**! 🌟`,
    `Terima kasih **${userName}**! 🙏`,
  ];

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];

  return `${greeting} BestieAI di sini. Saya akan membantu meringkas pertanyaan Anda:

> 📋 **Ringkasan Pertanyaan:**
> 
> ${filteredSummary.split("\n").join("\n> ")}

✅ Pertanyaan Anda telah tercatat dan sedang dalam proses.`;
};

/**
 * Format rekomendasi jawaban dengan markdown yang lebih structured
 * Termasuk filter PII untuk keamanan data
 */
const formatRecommendationComment = (answer) => {
  // Filter PII dari answer sebelum ditampilkan
  const filteredAnswer = filterPII(answer);

  const openings = [
    "🔍 Setelah menelusuri database pengetahuan kami",
    "📚 Berdasarkan basis pengetahuan yang tersedia",
    "💡 Dari referensi FAQ yang saya miliki",
    "📖 Dari kamus jawaban BKD",
  ];

  const opening = openings[Math.floor(Math.random() * openings.length)];

  return `${opening}, berikut yang dapat saya sampaikan:

${filteredAnswer}

---

> ⚠️ **Catatan:** _Ini adalah rekomendasi otomatis dari AI berdasarkan FAQ. Petugas BKD akan segera memverifikasi dan memberikan jawaban resmi._`;
};

/**
 * Format pesan default ketika tidak ada FAQ yang relevan
 */
const formatDefaultWaitingMessage = (userName) => {
  const messages = [
    {
      intro: "Pertanyaan Anda cukup spesifik dan memerlukan penanganan khusus",
      icon: "🔔",
    },
    {
      intro:
        "Saya belum menemukan informasi yang cukup relevan di database FAQ",
      icon: "📝",
    },
    {
      intro: "Pertanyaan Anda memerlukan penjelasan lebih detail dari petugas",
      icon: "💬",
    },
  ];

  const msg = messages[Math.floor(Math.random() * messages.length)];

  return `Halo **${userName}**! 👋 BestieAI di sini.

${msg.icon} ${msg.intro}.

> **Status:** Pertanyaan Anda telah diteruskan ke **Tim BKD Provinsi Jawa Timur**.
> 
> Petugas kami akan segera memberikan jawaban yang tepat. Mohon menunggu ya! 🙏

_Terima kasih atas kesabaran Anda._`;
};

/**
 * Extract nama depan dari username
 */
const getFirstName = (fullName) => {
  if (!fullName) return "Bapak/Ibu";
  const parts = fullName.trim().split(" ");
  // Ambil 1-2 kata pertama
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0];
};

/**
 * Process summarize-ticket job
 * @param {Object} job - Bull job object
 * @returns {Promise<Object>} - Result dengan status dan data
 */
const processSummarizeTicket = async (job) => {
  const { ticketId } = job.data;

  console.log(
    `🎫 [TICKET PROCESSOR] Processing ticket AI for: ${ticketId} (Job: ${job.id})`
  );

  try {
    // 1. Ambil data ticket dari database dengan info requester
    const ticket = await Tickets.query()
      .findById(ticketId)
      .withGraphFetched("customer")
      .select("id", "title", "content", "sub_category_id", "requester");

    if (!ticket) {
      console.warn(
        `⚠️ [TICKET PROCESSOR] Ticket not found: ${ticketId}, skipping...`
      );
      return { success: false, reason: "ticket_not_found" };
    }

    // Get user name
    const userName = getFirstName(ticket.customer?.username);

    // Update progress
    await job.progress(10);

    // 2. Generate ringkasan AI dari content menggunakan OpenAI
    const fullContent = `${ticket.title || ""}\n${ticket.content || ""}`.trim();
    let summarize_ai = null;
    let summaryComment = null;

    if (fullContent) {
      console.log(
        `📝 [TICKET PROCESSOR] Generating AI summary for ticket: ${ticketId}`
      );

      const summaryResult = await generateSummary(fullContent);
      if (summaryResult.success) {
        summarize_ai = summaryResult.data;

        // Buat comment dengan format markdown yang structured
        summaryComment = formatSummaryComment(userName, summarize_ai);

        console.log(
          `✅ [TICKET PROCESSOR] Summary generated for ticket: ${ticketId}`
        );
      } else {
        console.warn(
          `⚠️ [TICKET PROCESSOR] Failed to generate summary:`,
          summaryResult.error
        );
      }
    }

    await job.progress(40);

    // 3. Get recommendation menggunakan shared service (sama dengan /api/ref/faq-qna/ask)
    const questionForSearch = summarize_ai || fullContent;
    let recomendation_answer = null;
    let recommendationComment = null;
    let hasRelevantFAQ = false;

    if (questionForSearch) {
      console.log(
        `🔍 [TICKET PROCESSOR] Getting recommendation for ticket: ${ticketId}`
      );

      const recommendationResult = await getTicketRecommendation(
        questionForSearch,
        ticket.sub_category_id,
        5 // limit
      );

      await job.progress(70);

      if (recommendationResult.success && recommendationResult.answer) {
        // Hanya simpan jika ada sources (FAQ yang relevan ditemukan)
        if (
          recommendationResult.sources &&
          recommendationResult.sources.length > 0
        ) {
          recomendation_answer = recommendationResult.answer;
          hasRelevantFAQ = true;

          // Buat comment dengan format markdown yang structured
          recommendationComment =
            formatRecommendationComment(recomendation_answer);

          console.log(
            `✅ [TICKET PROCESSOR] Recommendation generated for ticket: ${ticketId} (${recommendationResult.sources.length} sources, method: ${recommendationResult.search_method})`
          );
        } else {
          // Tidak ada FAQ yang relevan - gunakan pesan default dengan format
          recomendation_answer = formatDefaultWaitingMessage(userName);
          recommendationComment = recomendation_answer;
          console.log(
            `ℹ️ [TICKET PROCESSOR] No relevant FAQ found for ticket: ${ticketId}, using default message`
          );
        }
      } else if (!recommendationResult.success) {
        // Error saat mencari - gunakan pesan default dengan format
        recomendation_answer = formatDefaultWaitingMessage(userName);
        recommendationComment = recomendation_answer;
        console.warn(
          `⚠️ [TICKET PROCESSOR] Failed to get recommendation:`,
          recommendationResult.error
        );
      } else {
        // Tidak ada answer - gunakan pesan default dengan format
        recomendation_answer = formatDefaultWaitingMessage(userName);
        recommendationComment = recomendation_answer;
        console.log(
          `ℹ️ [TICKET PROCESSOR] No recommendation available for ticket: ${ticketId}, using default message`
        );
      }
    }

    await job.progress(85);

    // 4. Update ticket dengan hasil AI
    const updateData = {};
    if (summarize_ai) {
      updateData.summarize_ai = summarize_ai;
    }
    if (recomendation_answer) {
      updateData.recomendation_answer = recomendation_answer;
    }

    if (Object.keys(updateData).length > 0) {
      await Tickets.query().findById(ticketId).patch(updateData);
      console.log(
        `✅ [TICKET PROCESSOR] Updated ticket ${ticketId} with AI data`
      );
    }

    // 5. Tambahkan comment dari BestieAI
    const commentsToInsert = [];
    const notificationsToInsert = [];

    // Comment ringkasan (jika ada)
    if (summaryComment) {
      commentsToInsert.push({
        ticket_id: ticketId,
        user_id: BESTIE_AI_BOT_ID,
        comment: summaryComment,
        role: "agent", // BestieAI berperan sebagai agent
      });
    }

    // Comment rekomendasi (jika ada)
    if (recommendationComment) {
      commentsToInsert.push({
        ticket_id: ticketId,
        user_id: BESTIE_AI_BOT_ID,
        comment: recommendationComment,
        role: "agent",
      });
    }

    // Insert comments
    if (commentsToInsert.length > 0) {
      await TicketsCommentsCustomers.query().insert(commentsToInsert);
      console.log(
        `💬 [TICKET PROCESSOR] Added ${commentsToInsert.length} BestieAI comments for ticket: ${ticketId}`
      );
    }

    // 6. Kirim notifikasi ke user penanya
    if (ticket.requester && commentsToInsert.length > 0) {
      // Notifikasi untuk ringkasan
      if (summaryComment) {
        notificationsToInsert.push({
          to: ticket.requester,
          from: BESTIE_AI_BOT_ID,
          type_id: ticketId,
          type: "bestie_ai_summary",
          content: "BestieAI telah meringkas pertanyaan Anda",
          title: "🤖 Ringkasan dari BestieAI",
          role: "requester",
          ticket_id: ticketId,
        });
      }

      // Notifikasi untuk rekomendasi
      if (recommendationComment) {
        const notifContent = hasRelevantFAQ
          ? "BestieAI memberikan rekomendasi jawaban untuk pertanyaan Anda"
          : "BestieAI telah menerima pertanyaan Anda";

        notificationsToInsert.push({
          to: ticket.requester,
          from: BESTIE_AI_BOT_ID,
          type_id: ticketId,
          type: "bestie_ai_recommendation",
          content: notifContent,
          title: hasRelevantFAQ
            ? "💡 Rekomendasi dari BestieAI"
            : "📨 Pertanyaan Diterima",
          role: "requester",
          ticket_id: ticketId,
        });
      }

      // Insert notifications
      if (notificationsToInsert.length > 0) {
        await Notifications.query().insert(notificationsToInsert);
        console.log(
          `🔔 [TICKET PROCESSOR] Sent ${notificationsToInsert.length} notifications to user: ${ticket.requester}`
        );
      }
    }

    await job.progress(100);

    return {
      success: true,
      ticketId,
      hasSummary: !!summarize_ai,
      hasRecommendation: !!recomendation_answer,
      hasRelevantFAQ,
      commentsAdded: commentsToInsert.length,
      notificationsSent: notificationsToInsert.length,
    };
  } catch (error) {
    console.error(
      `❌ [TICKET PROCESSOR] Failed to process ticket ${ticketId}:`,
      error.message
    );
    throw error;
  }
};

module.exports = {
  processSummarizeTicket,
};
