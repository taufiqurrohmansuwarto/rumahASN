import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import { download as downloadLampiran } from "@/controller/perencanaan/lampiran.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).get(downloadLampiran);

export default router.handler({});

