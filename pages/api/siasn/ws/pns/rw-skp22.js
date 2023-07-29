import { getSkp2022 } from "@/controller/siasn.controller";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(siasnMiddleware).get(getSkp2022);

export default router.handler();
