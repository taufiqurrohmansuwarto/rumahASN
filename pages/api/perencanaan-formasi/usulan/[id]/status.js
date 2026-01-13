import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitator from "@/middleware/admin-fasilitator.middleware";
import { updateStatus } from "@/controller/perencanaan/usulan.controller";

const router = createRouter();

router.use(auth).use(adminFasilitator).patch(updateStatus);

export default router.handler({});

