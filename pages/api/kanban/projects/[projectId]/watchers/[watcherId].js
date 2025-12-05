import {
  updateWatcher,
  removeWatcher,
} from "@/controller/kanban/members.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).patch(updateWatcher).delete(removeWatcher);

export default router.handler({});

