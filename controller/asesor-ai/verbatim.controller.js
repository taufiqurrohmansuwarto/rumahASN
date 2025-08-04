// === ES6 Imports ===
import VerbatimSessions from "@/models/verbatim-ai/verbatim-sessions.model";
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";
import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";
import OpenAI from "openai";
import axios from "axios";
import {
  MAX_DURATION_SECONDS,
  CHUNK_DURATION_SECONDS,
  removeTempFile,
  generateAudioFilename,
  createTempFile,
  convertToMp3,
  getAudioDuration,
  calculateChunksNeeded,
  uploadChunksToMinio,
} from "@/utils/verbatim-ai.utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === CommonJS Imports ===
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

// === Controller Functions ===

/**
 * Controller untuk upload rekaman audio verbatim (tanpa splitting)
 * Hanya upload file tunggal ke minio dan buat session record
 */
export const uploadRekamanVerbatim = async (req, res) => {
  let tempFilePath = null;
  let sessionId = null;

  try {
    // === Extract request data ===
    const { file, mc } = req;
    const { nama_asesor, nama_asesi, tgl_wawancara } = req.body;

    // === Validate required fields ===
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File audio tidak ditemukan",
      });
    }

    // === Process audio file ===
    const audioFilename = generateAudioFilename(file.mimetype); // Always .mp3 now
    const originalTempFilename = `original_${nanoid(10)}.${
      file.mimetype.split("/")[1]
    }`;

    tempFilePath = createTempFile(file.buffer, originalTempFilename);

    // === Get audio duration ===
    const audioDurationSeconds = await getAudioDuration(tempFilePath);

    // === Convert to MP3 if needed ===
    let mp3FilePath = tempFilePath;
    if (!audioFilename.toLowerCase().endsWith(".mp3")) {
      console.log(`Converting ${audioFilename} to MP3 format...`);
      mp3FilePath = await convertToMp3(tempFilePath, audioFilename);
      console.log(`Successfully converted to MP3: ${audioFilename}`);
    }

    // === Upload single file to Minio ===
    const fileBuffer = fs.readFileSync(mp3FilePath);
    await uploadFileMinio(
      mc,
      fileBuffer,
      audioFilename,
      fileBuffer.length,
      "audio/mpeg"
    );

    // === Determine if splitting will be needed ===
    const willBeSplit = audioDurationSeconds > MAX_DURATION_SECONDS;
    const estimatedFileCount = willBeSplit
      ? calculateChunksNeeded(audioDurationSeconds)
      : 1;

    // === Create session record ===
    const session = await VerbatimSessions.query().insert({
      file_path: `/public/${audioFilename}`,
      status: willBeSplit ? "uploaded" : "done", // "uploaded" jika butuh splitting, "done" jika tidak
      jumlah_file: estimatedFileCount,
      nama_asesor,
      nama_asesi,
      tgl_wawancara,
    });

    sessionId = session?.id;

    // === Jika tidak perlu split, insert single audio file record ===
    if (!willBeSplit) {
      await VerbatimAudioFiles.query().insert({
        session_id: sessionId,
        part_number: 1,
        file_path: `/public/${audioFilename}`,
        durasi: Math.round(audioDurationSeconds),
      });
    }

    // === Cleanup temporary files ===
    removeTempFile(tempFilePath);
    if (mp3FilePath !== tempFilePath) {
      removeTempFile(mp3FilePath);
    }
    tempFilePath = null;

    console.log(
      `Audio upload completed - Session: ${sessionId}, Duration: ${audioDurationSeconds}s, Needs Split: ${willBeSplit}`
    );

    // === Send success response ===
    const responseMessage = willBeSplit
      ? "File berhasil diupload. Gunakan endpoint split untuk memecah audio."
      : "File berhasil diupload";

    res.json({
      success: true,
      message: responseMessage,
      data: {
        sessionId: sessionId,
        originalDuration: audioDurationSeconds,
        needsSplit: willBeSplit,
        estimatedChunks: willBeSplit ? estimatedFileCount : 1,
        session: {
          id: sessionId,
          nama_asesor,
          nama_asesi,
          tgl_wawancara,
          status: willBeSplit ? "uploaded" : "done",
          jumlah_file: estimatedFileCount,
          file_path: `/public/${audioFilename}`,
        },
        ...(willBeSplit && {
          splitRequired: true,
          maxDurationSeconds: MAX_DURATION_SECONDS,
          chunkDurationSeconds: CHUNK_DURATION_SECONDS,
          splitEndpoint: `/api/asesor-ai/verbatim/${sessionId}/split`,
        }),
      },
    });
  } catch (error) {
    // === Cleanup on error ===
    if (tempFilePath) {
      removeTempFile(tempFilePath);
    }

    // === Rollback session if created ===
    if (sessionId) {
      try {
        // Delete audio files records first (due to foreign key constraints)
        await VerbatimAudioFiles.query()
          .delete()
          .where("session_id", sessionId);

        // Then delete the session
        await VerbatimSessions.query().deleteById(sessionId);

        console.log(`Rolled back session ${sessionId} due to error`);
      } catch (rollbackError) {
        console.error(
          `Failed to rollback session ${sessionId}:`,
          rollbackError
        );
      }
    }

    console.error("Error in uploadRekamanVerbatim:", error);
    handleError(res, error);
  }
};

export const getRekamanVerbatim = async (req, res) => {
  try {
    const result = await VerbatimSessions.query().orderBy("created_at", "desc");
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const splitAudioVerbatim = async (req, res) => {
  let tempFilePath = null;
  const startTime = Date.now();

  try {
    const { id } = req.query;
    const { mc } = req; // Minio client from middleware

    console.log(`Starting split process for session ${id}`);

    // === Validate session ===
    const session = await VerbatimSessions.query().findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session tidak ditemukan",
      });
    }

    // === Check if session is ready for splitting ===
    if (session.status !== "uploaded") {
      return res.status(400).json({
        success: false,
        message:
          "Session tidak dalam status uploaded. Status saat ini: " +
          session.status,
      });
    }

    // === Prevent concurrent splitting on same session ===
    const existingAudioFiles = await VerbatimAudioFiles.query()
      .where("session_id", id)
      .first();

    if (existingAudioFiles) {
      return res.status(400).json({
        success: false,
        message: "Session sudah memiliki audio files, tidak perlu split lagi",
      });
    }

    // === Update session status to processing ===
    await VerbatimSessions.query().findById(id).patch({
      status: "processing",
    });

    console.log(`Session status updated to processing`);

    // === Download audio file from Minio ===
    const audioUrl = `https://siasn.bkd.jatimprov.go.id:9000${session.file_path}`;
    console.log(`Downloading audio from: ${audioUrl}`);

    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(response.data);
    const tempFileName = `${session?.id}.mp3`;

    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await fs.promises.writeFile(tempFilePath, audioBuffer);

    console.log(`Audio downloaded and saved to temp file: ${tempFileName}`);

    // === Get audio duration ===
    const audioDurationSeconds = await getAudioDuration(tempFilePath);
    console.log(`Audio duration: ${audioDurationSeconds} seconds`);

    // === Check if splitting is actually needed ===
    if (audioDurationSeconds <= MAX_DURATION_SECONDS) {
      // File doesn't need splitting, just create audio file record
      await VerbatimAudioFiles.query().insert({
        session_id: id,
        part_number: 1,
        file_path: session.file_path, // Store Minio path
        durasi: Math.round(audioDurationSeconds),
      });

      await VerbatimSessions.query().findById(id).patch({
        status: "done",
        jumlah_file: 1,
      });

      // Cleanup downloaded temp file
      removeTempFile(tempFilePath);
      tempFilePath = null;

      return res.json({
        success: true,
        message: "Audio tidak perlu dipecah, langsung selesai",
        data: {
          sessionId: id,
          totalDuration: audioDurationSeconds,
          isSplit: false,
          totalFiles: 1,
        },
      });
    }

    // === Split audio into chunks ===
    console.log(
      `Splitting audio into chunks (duration: ${audioDurationSeconds}s > max: ${MAX_DURATION_SECONDS}s)...`
    );

    // Import split function from utils
    const { splitAudioIntoChunks, insertChunksToDB } = await import(
      "@/utils/verbatim-ai.utils"
    );

    const chunkFiles = await splitAudioIntoChunks(
      tempFilePath,
      id,
      audioDurationSeconds
    );

    console.log(
      `Audio split into ${chunkFiles.length} chunks in tmp directory`
    );

    // === Upload chunks to Minio ===
    console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);
    const uploadedChunks = await uploadChunksToMinio(mc, chunkFiles);
    console.log(
      `Successfully uploaded ${uploadedChunks.length} chunks to Minio`
    );

    // === Insert chunk records to database (with Minio paths) ===
    const insertedRecords = await insertChunksToDB(id, uploadedChunks);
    console.log(
      `Successfully inserted ${insertedRecords.length} chunk records`
    );

    // === Update session status to completed ===
    await VerbatimSessions.query().findById(id).patch({
      status: "done",
      jumlah_file: uploadedChunks.length,
    });

    // === Cleanup original temporary file ===
    removeTempFile(tempFilePath);
    tempFilePath = null;

    const totalTime = (Date.now() - startTime) / 1000;
    console.log(
      `Audio split process completed for session ${id} in ${totalTime.toFixed(
        2
      )} seconds`
    );

    // === Send success response ===
    res.json({
      success: true,
      message: `Audio berhasil dipecah menjadi ${uploadedChunks.length} bagian`,
      data: {
        sessionId: id,
        originalDuration: audioDurationSeconds,
        isSplit: true,
        totalFiles: uploadedChunks.length,
        chunkDurationSeconds: CHUNK_DURATION_SECONDS,
        processingTimeSeconds: totalTime,
        files: uploadedChunks.map((chunk) => ({
          filename: chunk.filename,
          duration: chunk.duration,
          partNumber: chunk.partNumber,
          startTime: chunk.startTime,
          filePath: chunk.filePath, // Minio path
        })),
      },
    });
  } catch (error) {
    const totalTime = (Date.now() - startTime) / 1000;
    console.error(
      `Error in splitAudioVerbatim after ${totalTime.toFixed(2)} seconds:`,
      error
    );

    // === Cleanup on error ===
    if (tempFilePath) {
      removeTempFile(tempFilePath);
    }

    // === Rollback session status on error ===
    try {
      const { id } = req.query;
      if (id) {
        await VerbatimSessions.query().findById(id).patch({
          status: "uploaded", // Rollback to uploaded status
        });
        console.log(
          `Rolled back session ${id} status to uploaded due to error`
        );
      }
    } catch (rollbackError) {
      console.error(`Failed to rollback session status:`, rollbackError);
    }

    handleError(res, error);
  }
};

export const getAudioVerbatim = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await VerbatimAudioFiles.query()
      .where("session_id", id)
      .orderBy("part_number", "asc");

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const detailAudioVerbatim = async (req, res) => {
  try {
    const { id, audioId } = req?.query;
    const result = await VerbatimAudioFiles.query()
      .where("session_id", id)
      .where("id", audioId)
      .first();

    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

export const transribeAudioVerbatim = async (req, res) => {
  try {
    const { id, audioId } = req.query;

    const audioFile = await VerbatimAudioFiles.query()
      .where("id", audioId)
      .first();

    if (!audioFile) {
      return res.status(404).json({
        success: false,
        message: "Audio tidak ditemukan",
      });
    }

    // File is in Minio, download it for transcription
    const audioUrl = `https://siasn.bkd.jatimprov.go.id:9000${audioFile.file_path}`;

    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(response.data);

    // Extract filename from file_path dan buat temporary file
    const filename = path.basename(audioFile.file_path);
    const tempFilePath = path.join(os.tmpdir(), filename);

    // Simpan buffer ke temporary file
    await fs.promises.writeFile(tempFilePath, audioBuffer);

    // Gunakan file untuk transcription
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "id",
      response_format: "text",
    });

    // Cleanup temporary file after transcription
    await fs.promises.unlink(tempFilePath);

    // === Save transkrip to database ===
    await VerbatimAudioFiles.query().where("id", audioId).patch({
      transkrip: transcription,
    });

    res.json({
      success: true,
      message: "Berhasil transribe audio",
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const textToJson = async (req, res) => {
  try {
    const { id, audioId } = req.query;

    const audioFile = await VerbatimAudioFiles.query()
      .where("id", audioId)
      .first();

    // Step 4: Strukturkan menjadi JSON dialog dengan GPT
    const gptPrompt = `
Berikut adalah hasil transkrip wawancara antara asesor dan asesi (tanpa nama pembicara).
Tugasmu: ubah teks ini menjadi array JSON dengan properti:
- "index": nomor urut
- "role": "asesor" atau "asesi"
- "text": isi kalimat asli

Asumsikan:
- Asesor memulai, bertanya, mengarahkan
- Asesi menjawab, menceritakan, menjelaskan

Format output JSON:
[
  { "index": 1, "role": "asesor", "text": "..." },
  { "index": 2, "role": "asesi", "text": "..." }
]

Jangan ubah isi kalimat. Berikut transkripnya:
"""${audioFile.transkrip}"""
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Kamu adalah sistem anotator percakapan wawancara.",
        },
        { role: "user", content: gptPrompt },
      ],
      temperature: 0.2,
    });

    const rawJson = completion.choices[0].message.content;
    const cleaned = rawJson
      .replace(/^```json\n?/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    await VerbatimAudioFiles.query().where("id", audioId).patch({
      json_transkrip: cleaned,
    });

    res.json({
      success: true,
      message: "Berhasil mengubah teks menjadi JSON",
    });
  } catch (error) {
    handleError(res, error);
  }
};
