import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";

const router = createRouter();

router.use(auth).use(asnMiddleware).get();

export default router.handler({});
