import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { preview } from "@/controller/esign/esign-spesimen.controller";

const router = createRouter();

// POST /api/esign-bkd/spesimen/preview
// Preview HTML template (for debugging, text-only)
router.use(auth).post(preview);

export default router.handler({
  onError: (err, req, res) => {
    console.error("[API Error] Spesimen preview:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  },
});
