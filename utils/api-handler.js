// utils/api-handler.js
const { logger } = require("@/utils/logger");
export const apiErrorHandler = {
  onError: (err, req, res) => {
    logger.error("API Error:", err);
    res.status(err.statusCode || 500).json({
      code: err.statusCode || 500,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  },

  onNoMatch: (req, res) => {
    res.status(405).json({
      code: 405,
      message: `Method ${req.method} Not Allowed`,
    });
  },
};
