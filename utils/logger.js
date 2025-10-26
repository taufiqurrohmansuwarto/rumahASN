/**
 * Logger Service using Winston
 * Only logs when NODE_ENV !== "production"
 * CommonJS version for compatibility
 */

const winston = require("winston");

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// ANSI Color codes for better console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  // Background colors
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Custom format for better readability with colors
const customFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  // Colorize timestamp
  const coloredTimestamp = `${colors.dim}${timestamp}${colors.reset}`;

  // Colorize level based on type
  let coloredLevel;
  const upperLevel = level.toUpperCase();

  if (upperLevel.includes("ERROR")) {
    coloredLevel = `${colors.bright}${colors.red}[${upperLevel}]${colors.reset}`;
  } else if (upperLevel.includes("WARN")) {
    coloredLevel = `${colors.bright}${colors.yellow}[${upperLevel}]${colors.reset}`;
  } else if (upperLevel.includes("INFO")) {
    coloredLevel = `${colors.bright}${colors.cyan}[${upperLevel}]${colors.reset}`;
  } else if (upperLevel.includes("DEBUG")) {
    coloredLevel = `${colors.bright}${colors.magenta}[${upperLevel}]${colors.reset}`;
  } else {
    coloredLevel = `[${upperLevel}]`;
  }

  // Colorize message
  const coloredMessage = `${colors.white}${message}${colors.reset}`;

  let msg = `${coloredTimestamp} ${coloredLevel}: ${coloredMessage}`;

  // Add metadata if exists
  const metaKeys = Object.keys(meta).filter(
    (key) => key !== "level" && key !== "message" && key !== "timestamp"
  );
  if (metaKeys.length > 0) {
    const metaObj = {};
    metaKeys.forEach((key) => (metaObj[key] = meta[key]));
    msg += ` ${colors.dim}${JSON.stringify(metaObj)}${colors.reset}`;
  }

  // Add stack trace for errors
  if (stack) {
    msg += `\n${colors.dim}${stack}${colors.reset}`;
  }

  return msg;
});

// Configure transports based on environment
const transports = [];

if (!isProduction) {
  // Console transport for development
  transports.push(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
      ),
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

// Helper function to format arguments with colors
const formatArgs = (...args) => {
  return args
    .map((arg) => {
      // Handle Error objects specially with red color
      if (arg instanceof Error) {
        return `${colors.red}${arg.name}: ${arg.message}${colors.reset}\n${colors.dim}Stack: ${arg.stack}${colors.reset}`;
      }

      if (typeof arg === "object" && arg !== null) {
        try {
          // Colorize JSON output
          const jsonStr = JSON.stringify(arg, null, 2);
          return `${colors.green}${jsonStr}${colors.reset}`;
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
};

// Helper methods for easier usage (silent in production)
const log = {
  info: (...args) => {
    if (!isProduction) logger.info(formatArgs(...args));
  },

  error: (...args) => {
    if (!isProduction) logger.error(formatArgs(...args));
  },

  warn: (...args) => {
    if (!isProduction) logger.warn(formatArgs(...args));
  },

  debug: (...args) => {
    if (!isProduction) logger.debug(formatArgs(...args));
  },

  // Alias
  log: (...args) => {
    if (!isProduction) logger.info(formatArgs(...args));
  },
};

// Export for CommonJS
module.exports = { logger, log };
