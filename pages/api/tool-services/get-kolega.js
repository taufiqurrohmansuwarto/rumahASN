import { checkApiKey, checkRole } from "@/middleware/tool-services.middleware";
import { getKolega } from "@/utils/ai-utils";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(checkApiKey).use(checkRole).post(getKolega);

export default router.handler({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
});
