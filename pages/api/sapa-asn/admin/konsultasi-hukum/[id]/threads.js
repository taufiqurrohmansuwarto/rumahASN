import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import {
  getThreads,
  sendMessage,
} from "@/controller/sapa-asn/admin/konsultasi-hukum.controller";

const router = createRouter();

router.use(auth).use(adminMiddleware).get(getThreads).post(sendMessage);

export default router.handler();

