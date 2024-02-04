import {
  generateSealActivation,
  setTotpActivationCode,
} from "@/controller/app-bsre-seal.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).patch(generateSealActivation);

export default router.handler({});
