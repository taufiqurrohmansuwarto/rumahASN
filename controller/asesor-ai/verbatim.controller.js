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
 * Controller untuk upload rekaman audio verbatim
 * Handles file upload, duration validation, and temporary file cleanup
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

    // === Determine number of files based on duration ===
    const willBeSplit = audioDurationSeconds > MAX_DURATION_SECONDS;
    const estimatedFileCount = willBeSplit
      ? calculateChunksNeeded(audioDurationSeconds)
      : 1;

    // === Create session record ===
    const session = await VerbatimSessions.query().insert({
      file_path: `/public/${audioFilename}`,
      status: "processing",
      jumlah_file: estimatedFileCount,
      nama_asesor,
      nama_asesi,
      tgl_wawancara,
    });

    sessionId = session?.id;

    // === Process audio (split if needed) and upload to Minio + Database ===
    const audioProcessResult = await processAudioFile(
      tempFilePath,
      audioFilename,
      audioDurationSeconds,
      mc, // Pass Minio client for chunk uploads
      sessionId // Pass session ID for database inserts
    );

    // === Update session status to completed ===
    await VerbatimSessions.query().findById(sessionId).patch({
      status: "done",
      jumlah_file: audioProcessResult.files.length, // Update with actual file count
    });

    // === Cleanup original temporary file ===
    removeTempFile(tempFilePath);
    tempFilePath = null; // Reset to avoid double cleanup

    // Note: Chunk files are already cleaned up in uploadChunksToMinio

    console.log(
      `Audio processing completed - Session: ${sessionId}, Original Duration: ${audioDurationSeconds} seconds, Split: ${
        audioProcessResult.isSplit ? "Yes" : "No"
      }, Files: ${audioProcessResult.files.length}`
    );

    // === Send success response ===
    const responseMessage = audioProcessResult.isSplit
      ? `File berhasil diupload dan dipecah menjadi ${audioProcessResult.files.length} bagian`
      : "File berhasil diupload";

    res.json({
      success: true,
      message: responseMessage,
      data: {
        sessionId: sessionId,
        originalDuration: audioDurationSeconds,
        isSplit: audioProcessResult.isSplit,
        totalFiles: audioProcessResult.files.length,
        files: audioProcessResult.files,
        session: {
          id: sessionId,
          nama_asesor,
          nama_asesi,
          tgl_wawancara,
          status: "done",
          jumlah_file: audioProcessResult.files.length,
        },
        ...(audioProcessResult.isSplit && {
          chunkDurationSeconds: audioProcessResult.chunkDuration,
          splitReason: `Audio duration (${audioDurationSeconds}s) exceeds maximum allowed (${MAX_DURATION_SECONDS}s)`,
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
      model: "whisper-1",
    });

    // Cleanup temporary file
    await fs.promises.unlink(tempFilePath);

    console.log(transcription);

    res.json({
      success: true,
      message: "Berhasil transribe audio",
    });
  } catch (error) {
    handleError(res, error);
  }
};
