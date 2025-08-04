// === ES6 Imports ===
import VerbatimSessions from "@/models/verbatim-ai/verbatim-sessions.model";
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";
import { handleError } from "@/utils/helper/controller-helper";
import { uploadFileMinio, uploadFileMinioFput } from "@/utils/index";
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
const CHUNK_DURATION_SECONDS = 600; // 10 menit (reduced to create smaller chunks)
const MAX_CONCURRENT_OPERATIONS = 1; // Force sequential processing

/**
 * Rate limiting function to prevent too many requests
 * @param {number} delayMs - Delay in milliseconds
 */
const rateLimitDelay = async (delayMs) => {
  console.log(
    `Rate limiting: waiting ${delayMs}ms to prevent request overload...`
  );
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

/**
 * Check if a chunk file was already uploaded to Minio
 * @param {string} sessionId - Session ID
 * @param {number} partNumber - Part number of the chunk
 * @returns {Promise<boolean>} True if already exists in database
 */
const checkExistingChunkInDB = async (sessionId, partNumber) => {
  try {
    const existingChunk = await VerbatimAudioFiles.query()
      .where("session_id", sessionId)
      .where("part_number", partNumber)
      .first();

    return !!existingChunk;
  } catch (error) {
    console.error(`Error checking existing chunk: ${error.message}`);
    return false;
  }
};

/**
 * Check for existing temp chunk files from previous failed attempts
 * @param {string} sessionId - Session ID
 * @returns {Array} Array of existing chunk file info
 */
const checkExistingTempChunks = (sessionId) => {
  try {
    const tempDir = os.tmpdir();
    const files = fs.readdirSync(tempDir);
    const existingChunks = [];

    files.forEach((file) => {
      if (file.startsWith(`${sessionId}_part`) && file.endsWith(".mp3")) {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);

        if (stats.size > 0) {
          // Extract part number from filename
          const match = file.match(/_part(\d+)\.mp3$/);
          if (match) {
            const partNumber = parseInt(match[1]);
            existingChunks.push({
              filename: file,
              path: filePath,
              partNumber: partNumber,
              size: stats.size,
            });
          }
        } else {
          // Remove empty files
          console.log(`Removing empty temp file: ${file}`);
          removeTempFile(filePath);
        }
      }
    });

    if (existingChunks.length > 0) {
      console.log(
        `Found ${existingChunks.length} existing temp chunk files for session ${sessionId}`
      );
    }

    return existingChunks.sort((a, b) => a.partNumber - b.partNumber);
  } catch (error) {
    console.error(`Error checking existing temp chunks: ${error.message}`);
    return [];
  }
};

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
 * Processes chunks sequentially to avoid resource conflicts
 * @param {Object} mc - Minio client
 * @param {Array} chunkFiles - Array of chunk file info
 * @param {string} sessionId - Session ID to check for existing chunks
 * @returns {Promise<Array>} Array of uploaded file info
 */
const uploadChunksToMinio = async (mc, chunkFiles, sessionId = null) => {
  const uploadedChunks = [];

  // Process chunks sequentially to avoid timeout/lock issues
  for (let i = 0; i < chunkFiles.length; i++) {
    const chunk = chunkFiles[i];
    let retryCount = 0;
    const maxRetries = 3;

    // Check if chunk already exists in database (skip upload)
    if (sessionId) {
      const chunkExists = await checkExistingChunkInDB(
        sessionId,
        chunk.partNumber
      );
      if (chunkExists) {
        console.log(
          `Chunk ${chunk.filename} already exists in database, skipping upload...`
        );
        uploadedChunks.push({
          ...chunk,
          filePath: `/public/${chunk.filename}`,
          uploaded: true,
          skipped: true,
        });
        // Clean up temp file since we don't need it
        removeTempFile(chunk.path);
        continue;
      }
    }

    while (retryCount < maxRetries) {
      try {
        console.log(
          `Uploading chunk ${i + 1}/${chunkFiles.length}: ${chunk.filename}`
        );

        // Check if file exists in temp location
        if (!fs.existsSync(chunk.path)) {
          throw new Error(`Chunk file not found at ${chunk.path}`);
        }

        const fileStats = fs.statSync(chunk.path);
        if (fileStats.size === 0) {
          throw new Error(`Chunk file is empty: ${chunk.filename}`);
        }

        console.log(
          `Processing chunk file: ${chunk.filename} (${fileStats.size} bytes)`
        );

        const fileBuffer = fs.readFileSync(chunk.path);
        const filePath = `/public/${chunk.filename}`;

        // Use sequential upload to prevent rate limiting
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

        uploadedChunks.push({
          ...chunk,
          filePath,
          uploaded: true,
        });

        // Progressive delay between uploads to prevent rate limiting
        if (i < chunkFiles.length - 1) {
          // Progressive delay: increases with each chunk (3s, 4s, 5s, etc.)
          const progressiveDelay = 3000 + i * 1000;
          await rateLimitDelay(progressiveDelay);
        }

        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(
          `Failed to upload chunk ${chunk.filename} (attempt ${retryCount}/${maxRetries}):`,
          error
        );

        if (retryCount >= maxRetries) {
          // Clean up temp file even on final error
          removeTempFile(chunk.path);
          throw new Error(
            `Upload failed for chunk ${chunk.filename} after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Wait before retry with exponential backoff (increased base)
        const delay = Math.pow(2, retryCount) * 3000; // 6s, 12s, 24s
        console.log(`Retrying upload in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return uploadedChunks;
};

/**
 * Inserts audio file records to database
 * Processes records sequentially to avoid database lock issues
 * @param {string} sessionId - Session ID
 * @param {Array} files - Array of file info
 * @returns {Promise<Array>} Array of inserted records
 */
const insertAudioFilesToDB = async (sessionId, files) => {
  const insertedRecords = [];

  // Process database inserts sequentially to avoid lock timeout
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    let retryCount = 0;
    const maxRetries = 3;

    // Skip files that were already uploaded and exist in database
    if (file.skipped) {
      console.log(
        `Skipping database insert for part ${file.partNumber} - already exists`
      );
      // Get existing record
      const existingRecord = await VerbatimAudioFiles.query()
        .where("session_id", sessionId)
        .where("part_number", file.partNumber)
        .first();

      if (existingRecord) {
        insertedRecords.push(existingRecord);
      }
      continue;
    }

    while (retryCount < maxRetries) {
      try {
        console.log(
          `Inserting database record ${i + 1}/${files.length} for part ${
            file.partNumber
          }`
        );

        // Check if record already exists before inserting
        const existingRecord = await VerbatimAudioFiles.query()
          .where("session_id", sessionId)
          .where("part_number", file.partNumber)
          .first();

        if (existingRecord) {
          console.log(
            `Database record for part ${file.partNumber} already exists, using existing record`
          );
          insertedRecords.push(existingRecord);
        } else {
          const record = await VerbatimAudioFiles.query().insert({
            session_id: sessionId,
            part_number: file.partNumber,
            file_path: file.filePath || `/public/${file.filename}`,
            durasi: Math.round(file.duration), // Round to nearest second
          });
          insertedRecords.push(record);
        }

        // Progressive delay between database inserts to prevent lock conflicts
        if (i < files.length - 1) {
          // Progressive delay: increases with each insert (2s, 3s, 4s, etc.)
          const progressiveDelay = 2000 + i * 1000;
          await rateLimitDelay(progressiveDelay);
        }

        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(
          `Failed to insert database record for part ${file.partNumber} (attempt ${retryCount}/${maxRetries}):`,
          error
        );

        if (retryCount >= maxRetries) {
          throw new Error(
            `Database insert failed for part ${file.partNumber} after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Wait before retry with exponential backoff (increased base)
        const delay = Math.pow(2, retryCount) * 2000; // 4s, 8s, 16s
        console.log(`Retrying database insert in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return insertedRecords;
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
 * Processes chunks sequentially to avoid resource conflicts
 * @param {string} inputPath - Input audio file path
 * @param {string} sessionId - Session ID for consistent naming
 * @param {string} fileExtension - File extension
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Promise<Array>} Array of chunk file paths
 */
const splitAudioIntoChunks = async (
  inputPath,
  sessionId,
  fileExtension,
  totalDuration
) => {
  const chunksNeeded = calculateChunksNeeded(totalDuration);
  const chunkFiles = [];

  // Process chunks sequentially to avoid resource conflicts
  for (let i = 0; i < chunksNeeded; i++) {
    const startTime = i * CHUNK_DURATION_SECONDS;
    const chunkFilename = `${sessionId}_part${i + 1}.mp3`; // Session-based naming
    const chunkPath = path.join(os.tmpdir(), chunkFilename);

    const chunkInfo = {
      filename: chunkFilename,
      path: chunkPath,
      partNumber: i + 1,
      startTime: startTime,
      duration: Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime),
    };

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(
          `Processing chunk ${i + 1}/${chunksNeeded}: ${chunkFilename}`
        );

        // Check if chunk already exists from previous failed attempt
        if (fs.existsSync(chunkPath)) {
          console.log(
            `Found existing chunk file: ${chunkFilename}, using it...`
          );
          const existingSize = fs.statSync(chunkPath).size;
          if (existingSize > 0) {
            console.log(
              `Using existing chunk: ${chunkFilename} (${existingSize} bytes)`
            );
            chunkFiles.push(chunkInfo);
            break; // Use existing file, skip to next chunk
          } else {
            console.log(
              `Existing chunk file is empty, removing and recreating...`
            );
            removeTempFile(chunkPath);
          }
        }

        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .seekInput(startTime)
            .duration(
              Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime)
            )
            .toFormat("mp3")
            .audioCodec("libmp3lame")
            .audioBitrate(128)
            .output(chunkPath)
            .on("end", () => {
              console.log(`Successfully created chunk: ${chunkFilename}`);
              resolve();
            })
            .on("error", (error) => {
              reject(
                new Error(
                  `Failed to create chunk ${chunkFilename}: ${error.message}`
                )
              );
            })
            .run();
        });

        chunkFiles.push(chunkInfo);

        // Progressive delay between chunk processing to prevent resource conflicts
        if (i < chunksNeeded - 1) {
          // Progressive delay: increases with each chunk (2s, 3s, 4s, etc.)
          const progressiveDelay = 2000 + i * 1000;
          await rateLimitDelay(progressiveDelay);
        }

        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        console.error(
          `Failed to create chunk ${chunkFilename} (attempt ${retryCount}/${maxRetries}):`,
          error
        );

        // Clean up failed chunk file only if it exists and is corrupted
        if (fs.existsSync(chunkPath)) {
          const fileSize = fs.statSync(chunkPath).size;
          if (fileSize === 0) {
            removeTempFile(chunkPath);
          }
        }

        if (retryCount >= maxRetries) {
          // Cleanup any created files on final error (but preserve existing valid ones)
          chunkFiles.forEach((chunk) => {
            if (fs.existsSync(chunk.path)) {
              const fileSize = fs.statSync(chunk.path).size;
              if (fileSize === 0) {
                removeTempFile(chunk.path);
              }
            }
          });
          throw new Error(
            `Failed to split audio chunk ${chunkFilename} after ${maxRetries} attempts: ${error.message}`
          );
        }

        // Wait before retry with exponential backoff (increased base)
        const delay = Math.pow(2, retryCount) * 4000; // 8s, 16s, 32s
        console.log(`Retrying chunk creation in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return chunkFiles;
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
      sessionId, // Use session ID for consistent naming
      "mp3", // Always use mp3 extension
      duration
    );

    let uploadedChunks = chunkFiles;

    // Upload chunks to Minio if mc client provided
    if (mc) {
      console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);
      uploadedChunks = await uploadChunksToMinio(mc, chunkFiles, sessionId);
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
  const startTime = Date.now();

  try {
    const { id } = req.query;
    const { mc } = req; // Minio client from middleware

    console.log(
      `[${new Date().toISOString()}] Starting split process for session ${id}`
    );

    // === Validate session ===
    const session = await VerbatimSessions.query().findById(id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session tidak ditemukan",
      });
    }

    console.log(
      `[${new Date().toISOString()}] Session validated: ${session.file_path}`
    );

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

    console.log(
      `[${new Date().toISOString()}] Session status updated to processing`
    );

    // === Initial rate limiting delay ===
    await rateLimitDelay(2000); // 2 second initial delay

    // === Download audio file from Minio ===
    const audioUrl = `https://siasn.bkd.jatimprov.go.id:9000${session.file_path}`;
    console.log(`Downloading audio from: ${audioUrl}`);

    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const audioBuffer = Buffer.from(response.data);
    const originalFilename = path.basename(session.file_path);
    const tempFileName = `${session?.id}.mp3`;

    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await fs.promises.writeFile(tempFilePath, audioBuffer);

    console.log(`Audio downloaded and saved to temp file: ${tempFileName}`);

    // === Get audio duration ===
    const audioDurationSeconds = await getAudioDuration(tempFilePath);
    console.log(`Audio duration: ${audioDurationSeconds} seconds`);

    // === Delay after audio analysis before splitting ===
    await rateLimitDelay(1000); // 1 second delay

    // === Check for existing temp chunks from previous failed attempts ===
    const existingTempChunks = checkExistingTempChunks(id);
    if (existingTempChunks.length > 0) {
      console.log(
        `Found ${existingTempChunks.length} existing temp chunks that can be reused`
      );
    }

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

    const chunkFiles = await splitAudioIntoChunks(
      tempFilePath,
      id, // Use session ID for consistent naming
      "mp3",
      audioDurationSeconds
    );

    console.log(`Audio split into ${chunkFiles.length} chunks`);

    // === Delay between splitting and uploading ===
    console.log(
      "Waiting between splitting and uploading to prevent rate limiting..."
    );
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3 seconds delay

    // === Upload chunks to Minio ===
    console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);
    const uploadedChunks = await uploadChunksToMinio(mc, chunkFiles, id);
    console.log(`Successfully uploaded ${uploadedChunks.length} chunks`);

    // === Larger delay before database operations ===
    console.log(
      "Waiting before database operations to prevent rate limiting..."
    );
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Increased to 5 seconds

    // === Insert chunk records to database ===
    console.log(
      `Inserting ${uploadedChunks.length} chunk records to database...`
    );
    await insertAudioFilesToDB(id, uploadedChunks);
    console.log(`Successfully inserted ${uploadedChunks.length} chunk records`);

    // === Final delay before completing session ===
    await rateLimitDelay(2000); // 2 second final delay

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
      `[${new Date().toISOString()}] Audio split process completed for session ${id} in ${totalTime.toFixed(
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
          filePath: chunk.filePath,
        })),
      },
    });
  } catch (error) {
    const totalTime = (Date.now() - startTime) / 1000;
    console.error(
      `[${new Date().toISOString()}] Error in splitAudioVerbatim after ${totalTime.toFixed(
        2
      )} seconds:`,
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
          `[${new Date().toISOString()}] Rolled back session ${id} status to uploaded due to error`
        );
      }
    } catch (rollbackError) {
      console.error(
        `[${new Date().toISOString()}] Failed to rollback session status:`,
        rollbackError
      );
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
