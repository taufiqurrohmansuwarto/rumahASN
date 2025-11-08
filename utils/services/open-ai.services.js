// services/openai.service.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embedding
export const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      dimensions: 3072,
    });
    return {
      success: true,
      data: response.data[0].embedding,
    };
  } catch (error) {
    console.error("OpenAI embedding error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate answer from context (RAG)
export const generateAnswer = async (query, contextQnA) => {
  try {
    if (contextQnA.length === 0) {
      return {
        success: true,
        data: "Maaf, tidak ada informasi yang relevan untuk menjawab pertanyaan Anda.",
      };
    }

    const context = contextQnA
      .map((q, idx) => {
        const validInfo = q.valid_until
          ? `(Berlaku: ${q.valid_from} s/d ${q.valid_until})`
          : `(Berlaku sejak: ${q.valid_from})`;

        return `[${idx + 1}] Q: ${q.pertanyaan}\nA: ${
          q.jawaban
        }\n${validInfo}\nSumber: ${q.sumber_regulasi || "-"}`;
      })
      .join("\n\n");

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Kamu adalah asisten BKD Jawa Timur yang membantu menjawab pertanyaan seputar kepegawaian.

INSTRUKSI:
- Jawab berdasarkan knowledge base yang diberikan
- Perhatikan tanggal berlaku informasi
- Sebutkan sumber regulasi jika ada
- Jika informasi tidak mencukupi, katakan dengan jelas
- Gunakan bahasa Indonesia formal tapi ramah`,
        },
        {
          role: "user",
          content: `Knowledge Base:\n${context}\n\nPertanyaan: ${query}\n\nJawab dengan informatif dan lengkap:`,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    });

    return {
      success: true,
      data: response.choices[0].message.content,
    };
  } catch (error) {
    console.error("OpenAI completion error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Generate summary
export const generateSummary = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Buat ringkasan singkat dalam 1-2 kalimat.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    return {
      success: true,
      data: response.choices[0].message.content,
    };
  } catch (error) {
    console.error("OpenAI summary error:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
