import { createRouter } from "next-connect";
import auth from "middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { testing } from "@/controller/siasn-instansi/token.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(testing);

export default router.handler({});
