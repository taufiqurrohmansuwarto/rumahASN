import {
  tandaiPesertaHadir,
  tandaiPesertaTidakHadir,
} from "@/controller/meja-registrasi.controller";
import agentAdminMiddleware from "@/middleware/agent-admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(agentAdminMiddleware)
  .put(tandaiPesertaHadir)
  .delete(tandaiPesertaTidakHadir);

export default router.handler({});
