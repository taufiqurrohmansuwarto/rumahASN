import { testGenerate } from "@/controller/test-generate.controller";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
const router = createRouter();

router.use(auth).use(siasnMiddleware).get(testGenerate);

export default router.handler();
