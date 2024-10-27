import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getChat = async (req, res) => {
  try {
    const { threadId, message } = req.body;

    // Buat thread baru jika tidak ada threadId
    const currentThreadId =
      threadId ?? (await openai.beta.threads.create({})).id;

    console.log("currentThreadId", currentThreadId);

    // Buat pesan
    await openai.beta.threads.messages.create(currentThreadId, {
      role: "user",
      content: message,
    });

    // Buat run
    const run = await openai.beta.threads.runs.create(currentThreadId, {
      assistant_id:
        process.env.ASSISTANT_ID ??
        (() => {
          throw new Error("ASSISTANT_ID environment is not set");
        })(),
    });

    // Poll untuk status run
    let runStatus;
    do {
      runStatus = await openai.beta.threads.runs.retrieve(
        currentThreadId,
        run.id
      );
      if (runStatus.status === "failed") {
        throw new Error("Assistant run failed");
      }
      if (runStatus.status === "expired") {
        throw new Error("Assistant run expired");
      }
      if (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } while (runStatus.status !== "completed");

    // Ambil messages setelah run selesai
    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const latestMessage = messages.data[0];

    // Kirim response
    return res.json({
      threadId: currentThreadId,
      message: {
        id: latestMessage.id,
        role: latestMessage.role,
        content: latestMessage.content[0].text.value,
      },
      status: "completed",
    });
  } catch (error) {
    console.error("Error in assistant:", error);
    return res.status(500).json({
      error: error.message || "An error occurred",
      status: "error",
    });
  }
};

module.exports = {
  getChat,
};
