import { testGenerate } from "@/controller/test-generate.controller";
import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(testGenerate);

export default router.handler();
