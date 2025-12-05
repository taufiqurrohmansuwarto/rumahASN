import {
  getComments,
  addComment,
} from "@/controller/kanban/comments.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getComments).post(addComment);

export default router.handler({});

