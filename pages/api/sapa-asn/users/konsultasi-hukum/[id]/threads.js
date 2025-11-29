import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import {
  getThreadDetail,
  sendMessage,
} from "@/controller/sapa-asn/users/konsultasi-hukum.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).get(getThreadDetail).post(sendMessage);

export default router.handler();

