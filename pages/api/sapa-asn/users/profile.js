import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { getProfile } from "@/controller/sapa-asn/users/profile.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getProfile);

export default router.handler();
