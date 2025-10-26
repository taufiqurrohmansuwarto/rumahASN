import { createRouter } from "next-connect";
const router = createRouter();
import auth from "@/middleware/auth.middleware";
import {
  updateEmailJatimprovPegawai,
  deleteEmailJatimprovPegawai,
} from "@/controller/tte-submission/email-submission.controller";
import adminKominfoMiddleware from "@/middleware/admin-kominfo.middleware";

router
  .use(auth)
  .use(adminKominfoMiddleware)
  .patch(updateEmailJatimprovPegawai)
  .delete(deleteEmailJatimprovPegawai);

export default router.handler({});
