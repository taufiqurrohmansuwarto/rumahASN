import { pegawaiMaster, syncPegawai } from "@/controller/sync.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import clientCredentialsMiddleware from "@/middleware/client-credentials.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .use(clientCredentialsMiddleware)
  .get(pegawaiMaster)
  .put(syncPegawai);

export default router.handler({});
