// === ES6 Imports ===
import VerbatimSessions from "@/models/verbatim-ai/verbatim-sessions.model";
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";
import { handleError } from "@/utils/helper/controller-helper";
import { downloadAudio, uploadFileMinio } from "@/utils/index";
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

const os = require("os");

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
    console.log(`Downloading audio from: ${session.file_path}`);
    const filename = session.file_path.split("/").pop();

    const tempFileName = `${session?.id}.ogg`;

    tempFilePath = path.join(os.tmpdir(), tempFileName);
    const audioStream = await downloadAudio(mc, filename, tempFilePath);

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
    const { mc } = req; // Minio client dari middleware

    // === Validate request parameters ===
    if (!audioId) {
      return res.status(400).json({
        success: false,
        message: "AudioId tidak ditemukan",
      });
    }

    console.log(`Starting transcription for audioId: ${audioId}`);

    // === Get audio file record ===
    const audioFile = await VerbatimAudioFiles.query()
      .where("id", audioId)
      .first();

    if (!audioFile) {
      return res.status(404).json({
        success: false,
        message: "Audio tidak ditemukan",
      });
    }

    // === Check if already transcribed ===
    if (audioFile.transkrip) {
      return res.json({
        success: true,
        message: "Audio sudah memiliki transkrip",
        data: {
          audioId: audioId,
          transkrip: audioFile.transkrip,
        },
      });
    }

    let tempFilePath = null;

    try {
      // === Extract filename from file path ===
      const filename = audioFile.file_path.split("/").pop();
      console.log(`Processing audio file: ${filename}`);

      // === Create temp file path ===
      tempFilePath = path.join(os.tmpdir(), filename);
      console.log(`Temp file path: ${tempFilePath}`);

      // === Download audio from Minio ===
      await downloadAudio(mc, filename, tempFilePath);
      console.log(`Audio downloaded successfully`);

      // === Verify temp file exists ===
      if (!fs.existsSync(tempFilePath)) {
        throw new Error("File audio tidak berhasil didownload");
      }

      // === Create readable stream for OpenAI ===
      const audioStream = fs.createReadStream(tempFilePath);

      // === Transcribe audio with OpenAI Whisper ===
      console.log(`Starting transcription with OpenAI Whisper...`);
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        language: "id",
        response_format: "text",
      });

      console.log(`Transcription completed successfully`);

      // === Save transkrip to database ===
      await VerbatimAudioFiles.query().where("id", audioId).patch({
        transkrip: transcription,
      });

      console.log(`Transkrip saved to database for audioId: ${audioId}`);

      res.json({
        success: true,
        message: "Berhasil melakukan transkrip audio",
        data: {
          audioId: audioId,
          transkrip: transcription,
        },
      });
    } finally {
      // === Cleanup temp file ===
      if (tempFilePath) {
        removeTempFile(tempFilePath);
        console.log(`Temp file cleaned up: ${tempFilePath}`);
      }
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const textToJson = async (req, res) => {
  try {
    const { audioId } = req.query;

    // === Validasi parameter ===
    if (!audioId) {
      return res.status(400).json({
        success: false,
        message: "Parameter audioId diperlukan",
      });
    }

    console.log(`Processing text to JSON for audioId: ${audioId}`);

    // === Ambil data audio file ===
    const audioFile = await VerbatimAudioFiles.query()
      .where("id", audioId)
      .first();

    if (!audioFile) {
      return res.status(404).json({
        success: false,
        message: "Audio file tidak ditemukan",
      });
    }

    // === Validasi transkrip tersedia ===
    if (!audioFile.transkrip || audioFile.transkrip.trim() === "") {
      return res.status(400).json({
        success: false,
        message:
          "Transkrip belum tersedia. Silakan lakukan transkrip terlebih dahulu",
      });
    }

    // === Cek apakah JSON transkrip sudah ada ===
    if (audioFile.json_transkrip) {
      return res.status(400).json({
        success: false,
        message: "JSON transkrip sudah tersedia untuk audio file ini",
      });
    }

    console.log(`Converting transcript to JSON dialog format...`);

    // === Buat prompt GPT untuk strukturisasi dialog ===
    const gptPrompt = `
Berikut adalah hasil transkrip wawancara antara asesor dan asesi (tanpa nama pembicara).
Tugasmu: ubah teks ini menjadi array JSON dengan properti:
- "index": nomor urut dimulai dari 1
- "role": "asesor" atau "asesi" 
- "text": isi kalimat asli (jangan diubah) berikan tanda baca yang benar

Aturan identifikasi pembicara:
- Asesor: biasanya bertanya, mengarahkan, memberikan instruksi, memulai topik
- Asesi: biasanya menjawab, menceritakan pengalaman, menjelaskan situasi

Format output harus berupa array JSON yang valid:
[
  { "index": 1, "role": "asesor", "text": "..." },
  { "index": 2, "role": "asesi", "text": "..." }
]

PENTING: 
- Jangan mengubah isi kalimat sama sekali
- Pastikan output adalah JSON array yang valid
- Jika tidak yakin siapa pembicara, prioritaskan konteks percakapan

Transkrip:
"""${audioFile.transkrip}"""
`;

    const gpt4oPrompt = `
Anda adalah asisten yang bertugas mengubah transkrip wawancara antara asesor dan asesi ke dalam format JSON percakapan seperti ini:

[
  { "index": 1, "role": "asesor", "text": "..." },
  { "index": 2, "role": "asesi", "text": "..." }
]

### Instruksi Utama:
1. Pisahkan transkrip menjadi giliran bicara berdasarkan struktur percakapan.
2. Gabungkan beberapa kalimat yang masih dalam satu giliran ke dalam satu objek JSON.
3. **Semua kalimat pertanyaan wajib dianggap sebagai milik asesor.** Tidak perlu melihat konteks refleksi atau cerita pribadi.
4. Semua tanggapan, penjelasan, cerita, keluhan, pengalaman, maupun pembelaan dianggap milik asesi.
5. Nomori setiap percakapan menggunakan "index" yang berurutan, dimulai dari 1.
6. Koreksi ejaan atau kata yang tidak baku agar sesuai dengan Ejaan KBBI (misal: "belio" → "beliau", "pegawaian" → "kepegawaian").
7. Output hanya boleh berupa array JSON yang valid, **tanpa teks lain** di luar array tersebut.
8. Role pembicara hanya boleh berupa string: "asesor" atau "asesi".
9. Jika dalam satu giliran terdapat campuran kalimat pernyataan dan pertanyaan, maka pisahkan menjadi dua giliran:
   - Kalimat pernyataan tetap sebagai milik pembicara sebelumnya (biasanya asesi).
   - Kalimat pertanyaan **wajib dibuat giliran baru** dan diberi role "asesor", meskipun terlihat seperti lanjutan pembicaraan.

Aturan identifikasi pembicara:
- Asesor: biasanya bertanya, mengarahkan, memberikan instruksi, memulai topik
- Asesi: biasanya menjawab, menceritakan pengalaman, menjelaskan situasi

### Contoh:
[
  { "index": 1, "role": "asesor", "text": "Bisa Ibu ceritakan tugas utama di unit kerja Ibu?" },
  { "index": 2, "role": "asesi", "text": "Tugas utama saya menangani administrasi guru dan kepegawaian di sekolah." },
  { "index": 3, "role": "asesor", "text": "Apa saja kendala yang Ibu alami selama menjalankan tugas itu?" },
  { "index": 4, "role": "asesi", "text": "Kendalanya lebih ke waktu, karena sering tumpang tindih dengan pekerjaan lain." }
]

Berikut adalah transkrip yang perlu Anda ubah ke format tersebut:

"""
${audioFile.transkrip}
"""
    


    
        `.trim();

    // === Panggil OpenAI GPT untuk strukturisasi ===
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Kamu adalah sistem anotator dialog wawancara yang mengubah transkrip menjadi format JSON terstruktur. Selalu berikan output JSON yang valid.",
        },
        { role: "user", content: gpt4oPrompt },
      ],
      temperature: 0.1, // Lebih rendah untuk konsistensi
      max_tokens: 4000,
    });

    // === Ekstrak dan bersihkan response JSON ===
    let rawJson = completion.choices[0].message.content;

    // Hapus markdown code blocks jika ada
    const cleanedJson = rawJson
      .replace(/^```json\n?/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    // === Validasi JSON format ===
    try {
      const parsedJson = JSON.parse(cleanedJson);

      // Validasi struktur JSON
      if (!Array.isArray(parsedJson)) {
        throw new Error("Output bukan berupa array");
      }

      // Validasi setiap item dalam array
      parsedJson.forEach((item, idx) => {
        if (!item.index || !item.role || !item.text) {
          throw new Error(
            `Item ke-${idx + 1} tidak memiliki properti yang lengkap`
          );
        }

        if (!["asesor", "asesi"].includes(item.role)) {
          throw new Error(
            `Role tidak valid pada item ke-${idx + 1}: ${item.role}`
          );
        }
      });

      console.log(
        `JSON validation passed. Generated ${parsedJson.length} dialog entries`
      );
    } catch (parseError) {
      console.error("JSON validation failed:", parseError.message);
      throw new Error(`Format JSON tidak valid: ${parseError.message}`);
    }

    // === Simpan JSON transkrip ke database ===
    await VerbatimAudioFiles.query().where("id", audioId).patch({
      json_transkrip: cleanedJson,
    });

    console.log(`JSON transcript saved successfully for audioId: ${audioId}`);

    // === Return success response ===
    res.json({
      success: true,
      message: "Berhasil mengubah transkrip menjadi format JSON dialog",
      data: {
        audioId: audioId,
        dialogCount: JSON.parse(cleanedJson).length,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};
