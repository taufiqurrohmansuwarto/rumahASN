import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getById,
  cancel,
} from "@/controller/sapa-asn/users/advokasi.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getById).delete(cancel);

export default router.handler();
