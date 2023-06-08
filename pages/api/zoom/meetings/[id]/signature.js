import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getSignature } from "@/controller/zoom.controller";
const router = createRouter();

router.get(getSignature);

export default router.handler();
