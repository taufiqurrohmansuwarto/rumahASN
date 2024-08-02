import { comparePegawaiAdmin } from "@/controller/compare.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";
import auth from "../../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).use(adminMiddleware).get(comparePegawaiAdmin);

export default router.handler({});
