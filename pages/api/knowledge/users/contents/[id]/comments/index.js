import {
  createComment,
  getComments,
} from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(createComment).get(getComments);

export default router.handler({});
