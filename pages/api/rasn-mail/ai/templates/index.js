import auth from "@/middleware/auth.middleware";
import { getTemplates } from "@/controller/rasn-mail/ai.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getTemplates);

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).json({ message: err.message });
  },
});

