/**
 * Migration: Create BestieAI Bot User
 * Bot untuk AI-powered ticket responses dan FAQ assistance
 */

exports.up = async function (knex) {
  // Check if user already exists
  const existingUser = await knex("users")
    .where("custom_id", "bot|bestie-ai-001")
    .first();

  if (existingUser) {
    console.log("BestieAI bot user already exists, skipping...");
    return;
  }

  // Insert BestieAI bot user
  await knex("users").insert({
    custom_id: "bot|bestie-ai-001",
    username: "BestieAI (Bot BKD)",
    image:
      "https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-rect-avatar.png",
    id: "bestie-ai-001",
    from: "master",
    role: "USER",
    group: "MASTER",
    employee_number: null,
    birthdate: null,
    last_login: new Date(),
    email: "bestie-ai@bkd.jatimprov.go.id",
    organization_id: "123",
    current_role: "agent",
    is_online: true,
    frekuensi_kunjungan: 0,
    terakhir_diberi_rate: null,
    rating: 5,
    jumlah_tutup_rating: 0,
    deskripsi_rating: "AI Assistant Bot - BKD Provinsi Jawa Timur",
    terakhir_tutup_rating: null,
    about_me:
      "Saya adalah BestieAI, asisten virtual berbasis AI dari BKD Provinsi Jawa Timur. Saya siap membantu menjawab pertanyaan seputar kepegawaian dan layanan BKD.",
    info: JSON.stringify({
      is_bot: true,
      bot_type: "ai_assistant",
      bot_version: "1.0.0",
      capabilities: [
        "ticket_summarization",
        "faq_recommendation",
        "smart_search",
      ],
      description:
        "AI-powered assistant untuk helpdesk BKD Provinsi Jawa Timur",
      created_purpose: "Automatic ticket processing and FAQ recommendation",
    }),
    is_consultant: false,
    update_consultant_at: null,
    app_role_id: 3,
    status_kepegawaian: "PNS",
  });

  console.log("✅ BestieAI bot user created successfully");
};

exports.down = async function (knex) {
  await knex("users").where("custom_id", "bot|bestie-ai-001").del();
  console.log("✅ BestieAI bot user deleted");
};
