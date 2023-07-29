import { getAngkaKredit } from "@/controller/siasn.controller";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(siasnMiddleware).get(getAngkaKredit);

export default router.handler();
