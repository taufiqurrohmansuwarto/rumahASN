import { getSignature } from "@/controller/zoom.controller";
import { createRouter } from "next-connect";
const router = createRouter();

router.get(getSignature);

export default router.handler();
