import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { tmtCpnsLebihBesarDariTMTPNS } from "@/controller/kualitas-data/accuracy.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(tmtCpnsLebihBesarDariTMTPNS);

export default router.handler();
