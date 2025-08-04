// === Utility functions for Verbatim AI processing ===

// === CommonJS Imports ===
const { nanoid } = require("nanoid");
import ffmpeg from "fluent-ffmpeg";
const fs = require("fs");
const os = require("os");
const path = require("path");

// === ES6 Imports ===
import VerbatimAudioFiles from "@/models/verbatim-ai/verbatim-audio-files.model";
import { uploadFileMinio } from "@/utils/index";

// === Constants ===
export const MAX_DURATION_SECONDS = 3600; // 1 jam
export const CHUNK_DURATION_SECONDS = 600; // 10 menit

/**
 * Safely removes temporary file
 * @param {string} filePath - Path to file to remove
 */
export const removeTempFile = (filePath) => {
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
 * Generates unique filename with audio prefix and random ID
 * Always returns OGG format
 * @param {string} mimeType - File MIME type (ignored, always returns .ogg)
 * @returns {string} Generated filename with .ogg extension
 */
export const generateAudioFilename = (mimeType) => {
  return `audio_${nanoid(10)}.ogg`;
};

/**
 * Creates temporary file path and writes file buffer
 * @param {Buffer} fileBuffer - File buffer data
 * @param {string} filename - Name of the file
 * @returns {string} Temporary file path
 */
export const createTempFile = (fileBuffer, filename) => {
  const tempFilePath = path.join(os.tmpdir(), filename);
  fs.writeFileSync(tempFilePath, fileBuffer);
  return tempFilePath;
};

/**
 * Gets audio file duration using ffmpeg
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} Duration in seconds
 */
export const getAudioDuration = (filePath) => {
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
 * Calculates how many chunks are needed for long audio
 * @param {number} totalDuration - Total duration in seconds
 * @returns {number} Number of chunks needed
 */
export const calculateChunksNeeded = (totalDuration) => {
  return Math.ceil(totalDuration / CHUNK_DURATION_SECONDS);
};

/**
 * Converts audio file to OGG format using ffmpeg
 * @param {string} inputPath - Input file path
 * @param {string} outputFilename - Output OGG filename
 * @returns {Promise<string>} Output file path
 */
export const convertToMp3 = (inputPath, outputFilename) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(os.tmpdir(), outputFilename);

    ffmpeg(inputPath)
      .toFormat("ogg")
      .audioCodec("libvorbis")
      .audioBitrate(64)
      .output(outputPath)
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (error) => {
        reject(new Error(`Failed to convert to OGG: ${error.message}`));
      })
      .run();
  });
};

/**
 * Splits audio file into chunks using ffmpeg (simple version - no complex retry logic)
 * @param {string} inputPath - Input audio file path
 * @param {string} sessionId - Session ID for consistent naming
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Promise<Array>} Array of chunk file info
 */
export const splitAudioIntoChunks = async (
  inputPath,
  sessionId,
  totalDuration
) => {
  const chunksNeeded = calculateChunksNeeded(totalDuration);
  const chunkFiles = [];

  console.log(`Splitting audio into ${chunksNeeded} chunks...`);

  for (let i = 0; i < chunksNeeded; i++) {
    const startTime = i * CHUNK_DURATION_SECONDS;
    const chunkFilename = `${sessionId}_part${i + 1}.ogg`;
    const chunkPath = path.join(os.tmpdir(), chunkFilename);

    // Check if chunk already exists
    if (fs.existsSync(chunkPath)) {
      const stats = fs.statSync(chunkPath);
      if (stats.size > 0) {
        console.log(`Using existing chunk: ${chunkFilename}`);
        chunkFiles.push({
          filename: chunkFilename,
          path: chunkPath,
          partNumber: i + 1,
          startTime: startTime,
          duration: Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime),
        });
        continue;
      } else {
        removeTempFile(chunkPath);
      }
    }

    console.log(`Creating chunk ${i + 1}/${chunksNeeded}: ${chunkFilename}`);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .seekInput(startTime)
        .duration(Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime))
        .toFormat("ogg")
        .audioCodec("libvorbis")
        .audioBitrate(64)
        .output(chunkPath)
        .on("end", () => {
          console.log(`Created chunk: ${chunkFilename}`);
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

    chunkFiles.push({
      filename: chunkFilename,
      path: chunkPath,
      partNumber: i + 1,
      startTime: startTime,
      duration: Math.min(CHUNK_DURATION_SECONDS, totalDuration - startTime),
    });
  }

  return chunkFiles;
};

/**
 * Upload chunk files to Minio and clean up tmp files
 * @param {Object} mc - Minio client
 * @param {Array} chunkFiles - Array of chunk file info
 * @returns {Promise<Array>} Array of uploaded chunk info with Minio paths
 */
export const uploadChunksToMinio = async (mc, chunkFiles) => {
  const uploadedChunks = [];

  console.log(`Uploading ${chunkFiles.length} chunks to Minio...`);

  for (const chunk of chunkFiles) {
    console.log(`Uploading chunk ${chunk.partNumber}: ${chunk.filename}`);

    // Check if tmp file exists
    if (!fs.existsSync(chunk.path)) {
      throw new Error(`Chunk file not found at ${chunk.path}`);
    }

    const fileBuffer = fs.readFileSync(chunk.path);
    const minioPath = `/public/${chunk.filename}`;

    // Upload to Minio
    await uploadFileMinio(
      mc,
      fileBuffer,
      chunk.filename,
      fileBuffer.length,
      "audio/mpeg"
    );

    // Clean up tmp file after successful upload
    removeTempFile(chunk.path);
    console.log(`Uploaded and cleaned up chunk: ${chunk.filename}`);

    uploadedChunks.push({
      ...chunk,
      filePath: minioPath, // Minio path for database
    });
  }

  return uploadedChunks;
};

/**
 * Insert chunk records to database with Minio paths
 * @param {string} sessionId - Session ID
 * @param {Array} uploadedChunks - Array of uploaded chunk info
 * @returns {Promise<Array>} Array of inserted records
 */
export const insertChunksToDB = async (sessionId, uploadedChunks) => {
  const insertedRecords = [];

  console.log(
    `Inserting ${uploadedChunks.length} chunk records to database...`
  );

  for (const chunk of uploadedChunks) {
    // Check if record already exists
    const existingRecord = await VerbatimAudioFiles.query()
      .where("session_id", sessionId)
      .where("part_number", chunk.partNumber)
      .first();

    if (existingRecord) {
      console.log(
        `Database record for part ${chunk.partNumber} already exists`
      );
      insertedRecords.push(existingRecord);
    } else {
      const record = await VerbatimAudioFiles.query().insert({
        session_id: sessionId,
        part_number: chunk.partNumber,
        file_path: chunk.filePath, // Minio path
        durasi: Math.round(chunk.duration),
      });
      insertedRecords.push(record);
      console.log(
        `Inserted record for part ${chunk.partNumber} with Minio path`
      );
    }
  }

  return insertedRecords;
};
