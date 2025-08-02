import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { detailAudioVerbatim } from "@/controller/asesor-ai/verbatim.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(detailAudioVerbatim);

export default router.handler({});
