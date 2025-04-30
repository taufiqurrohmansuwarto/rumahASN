import { handleError } from "@/utils/helper/controller-helper";
import OpenAI from "openai";
const Tickets = require("@/models/tickets.model");

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
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Ringkas pertanyaan dari user menjadi 1 kalimat, dan jangan ada kata-kata yang tidak perlu",
        },
        {
          role: "user",
          content: ticket?.content || "",
        },
      ],
    });
    res.status(200).json({ summary: response.choices[0].message.content });
  } catch (error) {
    handleError(error, res);
  }
};
