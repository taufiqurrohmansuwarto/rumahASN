import { flushDataPengajuan } from "@/controller/tte-submission/tte-submission.controller";
import auth from "@/middleware/auth.middleware";
import prakomMiddleware from "@/middleware/prakom.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(prakomMiddleware).post(flushDataPengajuan);

export default router.handler({});
