import { handleError } from "@/utils/helper/controller-helper";
import OpenAI from "openai";
const Tickets = require("@/models/tickets.model");
const FaqQna = require("@/models/faq-qna.model");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SyncPegawai = require("@/models/sync-pegawai.model");

export const exportFineTunning = async (req, res) => {
  try {
    const knex = SyncPegawai.knex();

    const result = await knex.raw(`
	SELECT jsonb_build_object(
    'messages', jsonb_build_array(
        jsonb_build_object(
            'role', 'user',
            'content', tickets.title || E'\n' || COALESCE(tickets.content, '')
        ),
        jsonb_build_object(
            'role', 'assistant',
            'content', comments.comment
        )
    )
) AS message_json
FROM tickets
JOIN tickets_comments_customers AS comments
    ON tickets.id = comments.ticket_id
WHERE comments.is_answer = true

	`);

    // export as jsonl
    res.setHeader("Content-Type", "application/jsonl");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=fine-tuning-data.jsonl"
    );
    const jsonlData = result.rows
      .map((row) => JSON.stringify(row.message_json))
      .join("\n");
    res.status(200).send(jsonlData);
  } catch (error) {
    handleError(error, res);
  }
};

export const summarizeQuestion = async (req, res) => {
  try {
    const { id } = req.body;
    const ticket = await Tickets.query().findById(id).select("content");
    console.log("ini ticket", ticket);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Menggunakan model yang lebih murah
      max_tokens: 100, // Membatasi jumlah token untuk mengurangi biaya
      temperature: 0.7, // Mengatur temperature untuk hasil yang konsisten
      messages: [
        {
          role: "system",
          content:
            "Ringkas laporan berikut menjadi 1–2 kalimat yang menjelaskan inti masalah pelapor secara formal dan mudah dipahami. Jangan menyimpulkan di luar isi.",
        },
        {
          role: "user",
          content: ticket?.content || "",
        },
      ],
    });
    await Tickets.query().findById(id).patch({
      summarize_ai: response.choices[0].message.content,
    });
    res.status(200).json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.log("ini error", error);
    res.status(500).json({ summary: "Internal server error" });
  }
};

export const getSolution = async (req, res) => {
  try {
    const { question, id } = req.body;
    const faq = await FaqQna.query()
      .where("is_active", true)
      .andWhere("effective_date", "<=", new Date())
      .andWhere("expired_date", ">=", new Date());

    const fewShot = faq
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n");

    const finalPrompt = `${fewShot}\n\nQ: ${question}\nA:`;
    console.log("ini final prompt", finalPrompt);

    const solution = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "Anda adalah asisten kepegawaian BKD. Jawablah secara jelas dan sopan.",
        },
        { role: "user", content: finalPrompt },
      ],
    });

    const answer = solution.choices[0].message.content;
    console.log("ini answer", answer);
    await Tickets.query().findById(id).patch({
      recomendation_answer: answer,
    });

    res.status(200).json({ message: "Berhasil menambahkan jawaban" });
  } catch (error) {
    console.log("ini error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
