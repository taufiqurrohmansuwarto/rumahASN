import { handleError } from "@/utils/helper/controller-helper";

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
