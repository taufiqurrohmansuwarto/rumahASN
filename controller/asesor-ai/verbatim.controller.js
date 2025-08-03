// === ES6 Imports ===
import VerbatimSessions from "@/models/verbatim-ai/verbatim-sessions.model";
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";
import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio } from "@/utils/index";
import OpenAI from "openai";
import axios from "axios";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// === CommonJS Imports ===
const { nanoid } = require("nanoid");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const os = require("os");
const path = require("path");

// === Constants ===
const MAX_DURATION_SECONDS = 3600; // 1 jam
const CHUNK_DURATION_SECONDS = 1800; // 30 menit

/**
 * Generates unique filename with audio prefix and random ID
 * Always returns MP3 format
 * @param {string} mimeType - File MIME type (ignored, always returns .mp3)
 * @returns {string} Generated filename with .mp3 extension
 */
const generateAudioFilename = (mimeType) => {
  return `audio_${nanoid(10)}.mp3`;
};

/**
 * Creates temporary file path and writes file buffer
 * @param {Buffer} fileBuffer - File buffer data
 * @param {string} filename - Name of the file
 * @returns {string} Temporary file path
 */
const createTempFile = (fileBuffer, filename) => {
  const tempFilePath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(tempFilePath, fileBuffer);
  return tempFilePath;
};

/**
 * Converts audio file to MP3 format using ffmpeg
 * @param {string} inputPath - Input file path
 * @param {string} outputFilename - Output MP3 filename
 * @returns {Promise<string>} Output file path
 */
const convertToMp3 = (inputPath, outputFilename) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), outputFilename);

    ffmpeg(inputPath)
      .toFormat("mp3")
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .output(outputPath)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (error) => {
        reject(new Error(`Failed to convert to MP3: ${error.message}`));
      })
      .run();
  });
};

/**
 * Gets audio file duration using ffmpeg
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} Duration in seconds
 */
const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(new Error(`Failed to get audio duration: ${error.message}`));
        return;
      }

      const durationInSeconds = metadata?.format?.duration;
      if (!durationInSeconds) {
        reject(new Error("Invalid audio file: duration not found"));
        return;
      }

      resolve(durationInSeconds);
    });
  });
};

/**
 * Safely removes temporary file
 * @param {string} filePath - Path to file to remove
 */
const removeTempFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(
      `Warning: Failed to remove temp file ${filePath}:`,
      error.message
    );
  }
};

/**
 * Uploads chunk files to Minio storage and cleans up temp files
 * @param {Object} mc - Minio client
 * @param {Array} chunkFiles - Array of chunk file info
 * @returns {Promise<Array>} Array of uploaded file info
 */
const uploadChunksToMinio = async (mc, chunkFiles) => {
  const uploadPromises = chunkFiles.map(async (chunk) => {
    try {
      const fileBuffer = fs.readFileSync(chunk.path);
      const filePath = `/public/${chunk.filename}`;

      await uploadFileMinio(
        mc,
        fileBuffer,
        chunk.filename,
        fileBuffer.length,
        "audio/mpeg" // MP3 mime type
      );

      // Clean up temp file immediately after successful upload
      removeTempFile(chunk.path);
      console.log(`Uploaded and cleaned up chunk: ${chunk.filename}`);

      return {
        ...chunk,
        filePath,
        uploaded: true,
      };
    } catch (error) {
      console.error(`Failed to upload chunk ${chunk.filename}:`, error);
      // Clean up temp file even on error
      removeTempFile(chunk.path);
      throw new Error(
        `Upload failed for chunk ${chunk.filename}: ${error.message}`
      );
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Inserts audio file records to database
 * @param {string} sessionId - Session ID
 * @param {Array} files - Array of file info
 * @returns {Promise<Array>} Array of inserted records
 */
const insertAudioFilesToDB = async (sessionId, files) => {
  const insertPromises = files.map(async (file) => {
    return VerbatimAudioFiles.query().insert({
      session_id: sessionId,
      part_number: file.partNumber,
      file_path: file.filePath || `/public/${file.filename}`,
      durasi: Math.round(file.duration), // Round to nearest second
    });
  });

  return Promise.all(insertPromises);
};

/**
 * Calculates how many chunks are needed for long audio
 * @param {number} totalDuration - Total duration in seconds
 * @returns {number} Number of chunks needed
 */
const calculateChunksNeeded = (totalDuration) => {
  return Math.ceil(totalDuration / CHUNK_DURATION_SECONDS);
};

/**
 * Splits audio file into chunks using ffmpeg
 * @param {string} inputPath - Input audio file path
 * @param {string} baseFilename - Base filename without extension
 * @param {string} fileExtension - File extension
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Promise<Array>} Array of chunk file paths
 */
const splitAudioIntoChunks = (
  inputPath,
  baseFilename,
  fileExtension,
  totalDuration
) => {
  return new Promise((resolve, reject) => {
    const chunksNeeded = calculateChunksNeeded(totalDuration);
    const chunkFiles = [];
    let processedChunks = 0;

    for (let i = 0; i < chunksNeeded; i++) {
      const startTime = i * CHUNK_DURATION_SECONDS;
      const chunkFilename = `${baseFilename}_part${i + 1}.mp3`; // Always MP3
      const chunkPath = path.join(os.tmpdir(), chunkFilename);

      chunkFiles.push({
        filename: chunkFilename,
        path: chunkPath,
        partNumber: i + 1,
        startTime: startTime,
        duration: Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime),
      });

      ffmpeg(inputPath)
        .seekInput(startTime)
        .duration(Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime))
        .toFormat("mp3")
        .audioCodec("libmp3lame")
        .audioBitrate(128)
        .output(chunkPath)
        .on("end", () => {
          processedChunks++;
          if (processedChunks === chunksNeeded) {
            resolve(chunkFiles);
          }
        })
        .on("error", (error) => {
          // Cleanup any created files on error
          chunkFiles.forEach((chunk) => {
            removeTempFile(chunk.path);
          });
          reject(new Error(`Failed to split audio: ${error.message}`));
        })
        .run();
    }
  });
};

/**
 * Processes audio file - either returns single file info or splits into chunks
 * @param {string} tempFilePath - Temporary file path
 * @param {string} audioFilename - Audio filename
 * @param {number} duration - Audio duration in seconds
 * @param {Object} mc - Minio client (optional for upload)
 * @param {string} sessionId - Session ID for database insert (optional)
 * @returns {Promise<Object>} Processing result with file info
 */
const processAudioFile = async (
  tempFilePath,
  audioFilename,
  duration,
  mc = null,
  sessionId = null
) => {
  const baseFilename = audioFilename.split(".")[0];
  let mp3FilePath = null;

  try {
    // Convert to MP3 if not already MP3
    if (!audioFilename.toLowerCase().endsWith(".mp3")) {
      console.log(`Converting ${audioFilename} to MP3 format...`);
      mp3FilePath = await convertToMp3(tempFilePath, audioFilename);
      console.log(`Successfully converted to MP3: ${audioFilename}`);
    } else {
      mp3FilePath = tempFilePath;
    }

    // If duration is less than or equal to 1 hour, return single file info
    if (duration <= MAX_DURATION_SECONDS) {
      const singleFileInfo = {
        filename: audioFilename,
        duration: duration,
        partNumber: 1,
        filePath: `/public/${audioFilename}`,
      };

      // Upload single MP3 file to Minio if mc client provided
      if (mc) {
        const fileBuffer = fs.readFileSync(mp3FilePath);
        await uploadFileMinio(
          mc,
          fileBuffer,
          audioFilename,
          fileBuffer.length,
          "audio/mpeg"
        );

        // Clean up temp MP3 file after upload
        if (mp3FilePath !== tempFilePath) {
          removeTempFile(mp3FilePath);
        }
        console.log(`Uploaded and cleaned up single file: ${audioFilename}`);
      }

      // Insert single file to database if sessionId provided
      if (sessionId) {
        await insertAudioFilesToDB(sessionId, [singleFileInfo]);
        console.log(
          `Single audio file inserted to database for session ${sessionId}`
        );
      }

      return {
        isSplit: false,
        totalDuration: duration,
        files: [singleFileInfo],
      };
    }

    // Split audio into chunks
    console.log(
      `Audio duration (${duration}s) exceeds maximum (${MAX_DURATION_SECONDS}s). Splitting into ${CHUNK_DURATION_SECONDS}s chunks...`
    );

    const chunkFiles = await splitAudioIntoChunks(
      mp3FilePath,
      baseFilename,
      "mp3", // Always use mp3 extension
      duration
    );

    let uploadedChunks = chunkFiles;

    // Upload chunks to Minio if mc client provided
    if (mc) {
      console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);
      uploadedChunks = await uploadChunksToMinio(mc, chunkFiles);
      console.log(
        `Successfully uploaded ${uploadedChunks.length} chunks to Minio`
      );
    }

    // Clean up converted MP3 file if different from original
    if (mp3FilePath !== tempFilePath) {
      removeTempFile(mp3FilePath);
    }

    // Insert chunks to database if sessionId provided
    if (sessionId) {
      await insertAudioFilesToDB(sessionId, uploadedChunks);
      console.log(
        `${uploadedChunks.length} audio chunks inserted to database for session ${sessionId}`
      );
    }

    return {
      isSplit: true,
      totalDuration: duration,
      chunkDuration: CHUNK_DURATION_SECONDS,
      files: uploadedChunks.map((chunk) => ({
        filename: chunk.filename,
        duration: chunk.duration,
        partNumber: chunk.partNumber,
        startTime: chunk.startTime,
        filePath: chunk.filePath,
      })),
      tempPaths: [], // Chunks are already cleaned up after upload
    };
  } catch (error) {
    // Cleanup on error
    if (mp3FilePath && mp3FilePath !== tempFilePath) {
      removeTempFile(mp3FilePath);
    }
    throw error;
  }
};

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

  try {
    const { id } = req.query;
    const { mc } = req; // Minio client from middleware

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

    // === Update session status to processing ===
    await VerbatimSessions.query().findById(id).patch({
      status: "processing",
    });

    console.log(`Starting audio split process for session ${id}...`);

    // === Download audio file from Minio ===
    const audioUrl = `https://siasn.bkd.jatimprov.go.id:9000${session.file_path}`;
    console.log(`Downloading audio from: ${audioUrl}`);

    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(response.data);
    const originalFilename = path.basename(session.file_path);
    const tempFileName = `${session.id}_${nanoid(10)}.mp3`;

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
        file_path: session.file_path,
        durasi: Math.round(audioDurationSeconds),
      });

      await VerbatimSessions.query().findById(id).patch({
        status: "done",
        jumlah_file: 1,
      });

      removeTempFile(tempFilePath);

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

    const baseFilename = originalFilename.split(".")[0];
    const chunkFiles = await splitAudioIntoChunks(
      tempFilePath,
      baseFilename,
      "mp3",
      audioDurationSeconds
    );

    console.log(`Audio split into ${chunkFiles.length} chunks`);

    // === Upload chunks to Minio ===
    console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);
    const uploadedChunks = await uploadChunksToMinio(mc, chunkFiles);
    console.log(`Successfully uploaded ${uploadedChunks.length} chunks`);

    // === Insert chunk records to database ===
    console.log(
      `Inserting ${uploadedChunks.length} chunk records to database...`
    );
    await insertAudioFilesToDB(id, uploadedChunks);
    console.log(`Successfully inserted ${uploadedChunks.length} chunk records`);

    // === Update session status to completed ===
    await VerbatimSessions.query().findById(id).patch({
      status: "done",
      jumlah_file: uploadedChunks.length,
    });

    // === Cleanup original temporary file ===
    removeTempFile(tempFilePath);
    tempFilePath = null;

    console.log(`Audio split process completed for session ${id}`);

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
        files: uploadedChunks.map((chunk) => ({
          filename: chunk.filename,
          duration: chunk.duration,
          partNumber: chunk.partNumber,
          startTime: chunk.startTime,
          filePath: chunk.filePath,
        })),
      },
    });
  } catch (error) {
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

    console.error("Error in splitAudioVerbatim:", error);
    handleError(res, error);
  }
};

export const getAudioVerbatim = async (req, res) => {
  try {
    const { id } = req.query;
    const result = await VerbatimAudioFiles.query().where("session_id", id);
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

    // Gunakan temporary file untuk transcription
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "gpt-4o-mini-transcribe",
      language: "id",
      response_format: "text",
    });

    // Cleanup temporary file
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
