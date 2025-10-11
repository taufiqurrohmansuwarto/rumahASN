import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { test } from "@/controller/esign/esign-spesimen.controller";

const router = createRouter();

// GET /api/esign-bkd/spesimen/test
// Test Gotenberg connection
router.use(auth).get(test);

export default router.handler({
  onError: (err, req, res) => {
    console.error("[API Error] Spesimen test:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  },
});
