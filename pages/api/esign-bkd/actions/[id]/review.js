import auth from "@/middleware/auth.middleware";
import onlyBkd from "@/middleware/bkd.middleware";
import { createRouter } from "next-connect";
import { reviewDoc } from "@/controller/esign/esign-signature-details.controller";

const router = createRouter();

router
  .use(auth)
  .use(onlyBkd)
  .post(reviewDoc);

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