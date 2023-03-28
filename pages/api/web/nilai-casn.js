import { nilaiCasn, publikasiCasn } from "@/controller/vendor.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(nilaiCasn);

export default router.handler({});
