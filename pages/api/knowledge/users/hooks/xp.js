import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnPemprovMiddleware from "@/middleware/asn-pemprov.middleware";

const router = createRouter();

router.use(auth).get(asnPemprovMiddleware).get();

export default router.handler({});
