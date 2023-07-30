import { rwSkpMaster } from "@/controller/master.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(rwSkpMaster);

export default router.handler();
