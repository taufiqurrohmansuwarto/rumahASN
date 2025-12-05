import auth from "@/middleware/auth.middleware";
import { refineText } from "@/controller/rasn-mail/ai.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).post(refineText);

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).json({ message: err.message });
  },
});
