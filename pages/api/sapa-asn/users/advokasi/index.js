import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getAll,
  create,
} from "@/controller/sapa-asn/users/advokasi.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getAll).post(create);

export default router.handler();
