import { getDepartmentDetail } from "@/controller/master.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(adminFasilitatorAsnMiddleware).get(getDepartmentDetail);

export default router.handler({});
