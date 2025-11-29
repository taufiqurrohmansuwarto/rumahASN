import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { getById } from "@/controller/sapa-asn/users/konsultasi-hukum.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getById);

export default router.handler();

