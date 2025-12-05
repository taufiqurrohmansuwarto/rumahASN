import {
  updateColumn,
  deleteColumn,
} from "@/controller/kanban/columns.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).patch(updateColumn).delete(deleteColumn);

export default router.handler({});

