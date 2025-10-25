import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import { listEmailJatimprovPegawai } from "@/controller/tte-submission/email-submission.controller";
import adminKominfoMiddleware from "@/middleware/admin-kominfo.middleware";

router.use(auth).use(adminKominfoMiddleware).get(listEmailJatimprovPegawai);

export default router.handler({});
