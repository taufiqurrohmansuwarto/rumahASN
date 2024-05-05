import {
  createComment,
  getComments,
} from "@/controller/asn-discussions.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(getComments).post(createComment);

export default router.handler();
