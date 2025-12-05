import {
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
} from "@/controller/kanban/tasks.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).put(toggleSubtask).patch(updateSubtask).delete(deleteSubtask);

export default router.handler({});

