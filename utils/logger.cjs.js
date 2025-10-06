/**
 * Logger Service using Winston (CommonJS version)
 * Only logs when NODE_ENV !== "production"
 */

const winston = require("winston");

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Custom format for better readability
const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;

  // Add metadata if exists
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta)}`;
  }

  // Add stack trace for errors
  if (stack) {
    msg += `\n${stack}`;
  }

  return msg;
});

// Configure transports based on environment
const transports = [];

if (!isProduction) {
  // Console transport for development
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), customFormat),
    })
  );

  // Optional: File transport for development debugging
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), json()),
    })
  );

  transports.push(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(timestamp(), json()),
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  silent: isProduction, // Silent in production - NO LOGS AT ALL
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports,
  exitOnError: false,
});

// Helper methods for easier usage (silent in production)
const log = {
  info: (...args) => {
    if (!isProduction) logger.info(args.join(" "));
  },

  error: (...args) => {
    if (!isProduction) logger.error(args.join(" "));
  },

  warn: (...args) => {
    if (!isProduction) logger.warn(args.join(" "));
  },

  debug: (...args) => {
    if (!isProduction) logger.debug(args.join(" "));
  },

  // Alias
  log: (...args) => {
    if (!isProduction) logger.info(args.join(" "));
  },
};

module.exports = { logger, log };
module.exports.default = log;
