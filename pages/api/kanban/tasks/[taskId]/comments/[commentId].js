import {
  updateComment,
  deleteComment,
} from "@/controller/kanban/comments.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).patch(updateComment).delete(deleteComment);

export default router.handler({});

