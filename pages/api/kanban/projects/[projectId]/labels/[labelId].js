import {
  updateLabel,
  deleteLabel,
} from "@/controller/kanban/labels.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).patch(updateLabel).delete(deleteLabel);

export default router.handler({});

