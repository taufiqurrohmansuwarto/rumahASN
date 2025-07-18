import { createRouter } from "next-connect";
import auth from "middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { submitUsulanPeremajaanPendidikan } from "@/controller/siasn-instansi/token.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).post(submitUsulanPeremajaanPendidikan);

export default router.handler({});
