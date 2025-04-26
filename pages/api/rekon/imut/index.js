import { getImut } from "@/controller/rekon/rekon-imut.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { siasnMiddleware } from "@/middleware/siasn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(siasnMiddleware).use(adminMiddleware).get(getImut);

export default router.handler({});
