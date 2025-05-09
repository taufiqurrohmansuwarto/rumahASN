import { getEmployeeIPASN } from "@/controller/rekon/rekon-ipasn.controller";
import adminFasilitatorAsnMiddleware from "@/middleware/admin-fasilitator-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(adminFasilitatorAsnMiddleware).get(getEmployeeIPASN);

export default router.handler({});
