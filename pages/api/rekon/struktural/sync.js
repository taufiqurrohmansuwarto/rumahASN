import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { syncRekonStruktural } from "@/controller/rekon/rekon-struktural.controller";
import { siasnMiddleware } from "@/middleware/siasn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(siasnMiddleware)
  .use(adminMiddleware)
  .get(syncRekonStruktural);

export default router.handler();
