import { createRouter } from "next-connect";
import { callback } from "@/controller/esign/esign-bsre-transactions.controller";

const router = createRouter();

// Note: Callback endpoint doesn't need auth as it's called by BSrE
router.post(callback);

export default router.handler({
  onError: (err, req, res) => {
    console.error("API Error:", err.stack);
    res.status(500).json({
      message: err.message || "Something went wrong!"
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      message: `Method '${req.method}' Not Allowed`
    });
  },
});