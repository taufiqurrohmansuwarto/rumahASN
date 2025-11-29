import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { getSummary } from "@/controller/sapa-asn/users/dashboard.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getSummary);

export default router.handler();

