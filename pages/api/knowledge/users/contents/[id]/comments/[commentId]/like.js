import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { likeComment } from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(likeComment);

export default router.handler({});