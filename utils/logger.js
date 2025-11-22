/**
 * Enhanced Logger Service using Winston & Chalk
 * Beautiful console output for development
 * Structured logging for production
 * CommonJS version for compatibility
 */

const winston = require("winston");
const chalk = require("chalk");

const { combine, timestamp, json, printf, errors } = winston.format;

// Check if running in production
const isProduction = process.env.NODE_ENV === "production";

// Emoji per level for better visual recognition
const levelEmojis = {
  error: "❌",
  warn: "⚠️ ",
  info: "ℹ️ ",
  debug: "🔍",
  verbose: "💬",
  silly: "🎭",
};

// Custom format with Chalk - pretty and colorful!
const prettyFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  // Decorative border
  const border = chalk.gray("│");

  // Timestamp with elegant styling
  const time = chalk.dim(`[${timestamp}]`);

  // Level with emoji and colors
  let levelDisplay;
  const emoji = levelEmojis[level] || "📝";

  switch (level) {
    case "error":
      levelDisplay = chalk.bold.red(`${emoji} ERROR  `);
      break;
    case "warn":
      levelDisplay = chalk.bold.yellow(`${emoji} WARN   `);
      break;
    case "info":
      levelDisplay = chalk.bold.cyan(`${emoji} INFO   `);
      break;
    case "debug":
      levelDisplay = chalk.bold.magenta(`${emoji} DEBUG  `);
      break;
    case "verbose":
      levelDisplay = chalk.bold.blue(`${emoji} VERBOSE`);
      break;
    default:
      levelDisplay = chalk.white(`${emoji} ${level.toUpperCase()}`);
  }

  // Message with bold styling
  const styledMessage = chalk.white.bold(message);

  // Build the log line
  let output = `${time} ${levelDisplay} ${border} ${styledMessage}`;

  // Add metadata with pretty print and indentation
  const metaKeys = Object.keys(meta).filter(
    (key) => !["level", "message", "timestamp", "stack"].includes(key)
  );

  if (metaKeys.length > 0) {
    const metaObj = {};
    metaKeys.forEach((key) => {
      // Special handling for Error objects in metadata
      if (meta[key] instanceof Error) {
        metaObj[key] = {
          name: meta[key].name,
          message: meta[key].message,
          stack: meta[key].stack,
        };
      } else {
        metaObj[key] = meta[key];
      }
    });
    const metaStr = JSON.stringify(metaObj, null, 2);
    output +=
      "\n" +
      chalk.dim(
        metaStr
          .split("\n")
          .map((line) => `       ${line}`)
          .join("\n")
      );
  }

  // Stack trace with styling (from winston errors format or metadata)
  const errorStack = stack || (meta.error && meta.error.stack);
  if (errorStack) {
    const stackLines = errorStack.split("\n");
    output += "\n" + chalk.red.bold("  📚 Stack Trace:");
    output +=
      "\n" +
      stackLines
        .map((line, idx) => {
          // Highlight the first line (error message)
          if (idx === 0) {
            return chalk.red.bold(`    ${line}`);
          }
          // Dim the rest
          return chalk.gray(`    ${line}`);
        })
        .join("\n");
  }

  return output;
});

// Configure transports based on environment
const transports = [];

if (!isProduction) {
  // Development: Pretty console output with colors
  transports.push(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        prettyFormat
      ),
    })
  );

  // File transport for development debugging
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), json()),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(timestamp(), json()),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
} else {
  // Production: Structured JSON logging to files only
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), json()),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
      level: "warn",
      format: combine(timestamp(), json()),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? "warn" : "debug"),
  silent: false, // Jangan silent!
  format: combine(errors({ stack: true }), timestamp(), json()),
  transports,
  exitOnError: false,
});

// Helper function to format arguments with colors
const formatArgs = (...args) => {
  return args
    .map((arg) => {
      // Handle Error objects specially
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}${
          arg.stack ? "\nStack: " + arg.stack : ""
        }`;
      }

      if (typeof arg === "object" && arg !== null) {
        try {
          // Return JSON string
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");
};

// Helper methods for easier usage
const log = {
  info: (...args) => {
    logger.info(formatArgs(...args));
  },

  error: (...args) => {
    // Handle Error objects properly - don't stringify them
    const errorObj = args.find((arg) => arg instanceof Error);
    if (errorObj) {
      // Log with error object for proper stack trace
      const message = args
        .filter((arg) => !(arg instanceof Error))
        .map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg))
        .join(" ");
      logger.error(message || errorObj.message, { error: errorObj });

      // In development, also output to console.error for immediate visibility
      if (!isProduction) {
        console.error(
          chalk.red.bold("\n❌ ERROR CAUGHT:"),
          chalk.white(message || errorObj.message)
        );
        console.error(chalk.gray(errorObj.stack));
      }
    } else {
      logger.error(formatArgs(...args));
    }
  },

  warn: (...args) => {
    logger.warn(formatArgs(...args));
  },

  debug: (...args) => {
    logger.debug(formatArgs(...args));
  },

  verbose: (...args) => {
    logger.verbose(formatArgs(...args));
  },

  // Alias
  log: (...args) => {
    logger.info(formatArgs(...args));
  },

  // Special pretty logs (only in development)
  success: (message, meta) => {
    const msg = !isProduction ? `✅ ${message}` : message;
    logger.info(msg, meta || {});
  },

  loading: (message) => {
    const msg = !isProduction ? `⏳ ${message}...` : `${message}...`;
    logger.info(msg);
  },

  banner: (title, subtitle) => {
    if (!isProduction) {
      console.log("\n" + chalk.bold.cyan("═".repeat(80)));
      console.log(chalk.bold.yellow(`  🚀 ${title}`));
      if (subtitle) {
        console.log(chalk.dim(`     ${subtitle}`));
      }
      console.log(chalk.bold.cyan("═".repeat(80)) + "\n");
    } else {
      logger.info(`${title}${subtitle ? " - " + subtitle : ""}`);
    }
  },

  section: (title) => {
    if (!isProduction) {
      console.log("\n" + chalk.bold.cyan(`▶ ${title}`));
      console.log(chalk.gray("─".repeat(80)));
    } else {
      logger.info(`[Section] ${title}`);
    }
  },
};

// Export for CommonJS
module.exports = { logger, log };
