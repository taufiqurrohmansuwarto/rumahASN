import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { generate } from "@/controller/esign/esign-spesimen.controller";

const router = createRouter();

// POST /api/esign-bkd/spesimen/generate
// Generate specimen PNG from text inputs only (no file upload)
router.use(auth).post(generate);

export default router.handler({
  onError: (err, req, res) => {
    console.error("[API Error] Spesimen generate:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  },
});
