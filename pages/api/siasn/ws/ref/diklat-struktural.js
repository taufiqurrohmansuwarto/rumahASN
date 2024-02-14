import { getDiklatStruktural } from "@/controller/siasn.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getDiklatStruktural);

export default router.handler();
