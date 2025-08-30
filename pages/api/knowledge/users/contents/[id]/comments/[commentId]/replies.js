import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { getRepliesForComment } from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getRepliesForComment);

export default router.handler({});
