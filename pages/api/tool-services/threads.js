import { saveThreadAssistant } from "@/controller/tool-services.controller";
import { createRouter } from "next-connect";
import { checkRole } from "@/middleware/tool-services.middleware";
const router = createRouter();

router.use(checkRole).post(saveThreadAssistant);

export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
});
