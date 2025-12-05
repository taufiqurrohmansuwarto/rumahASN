import {
  getTimeEntriesByTask,
  logTimeEntry,
} from "@/controller/kanban/time-entries.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).get(getTimeEntriesByTask).post(logTimeEntry);

export default router.handler({});

