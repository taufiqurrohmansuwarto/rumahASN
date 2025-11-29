import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { getJadwal } from "@/controller/sapa-asn/users/advokasi.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getJadwal);

export default router.handler();

