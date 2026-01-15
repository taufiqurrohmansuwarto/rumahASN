import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import { downloadDokumen } from "@/controller/perencanaan/formasi_usulan.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(downloadDokumen);

export default router.handler({});
