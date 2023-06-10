import { getSignature } from "@/controller/zoom.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getSignature);

export default router.handler();
