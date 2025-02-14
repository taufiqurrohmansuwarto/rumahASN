import fasilitatorMasterMiddleware from "@/middleware/fasilitator-master.middleware";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { downloadSk } from "@/controller/download/download-sk.controller";

const router = createRouter();

router.use(auth).use(fasilitatorMasterMiddleware).get(downloadSk);

export default router.handler();
