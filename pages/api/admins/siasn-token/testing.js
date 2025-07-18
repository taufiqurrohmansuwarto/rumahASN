import { testing } from "@/controller/siasn-instansi/token.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(testing);

export default router.handler({});
