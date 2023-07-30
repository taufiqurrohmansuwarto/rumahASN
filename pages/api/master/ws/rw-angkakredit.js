import { rwAngkakreditMaster } from "@/controller/master.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(rwAngkakreditMaster);

export default router.handler();
