import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { likes } from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(likes);

export default router.handler({});
