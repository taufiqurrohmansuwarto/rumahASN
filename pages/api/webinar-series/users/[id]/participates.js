import {
  detailWebinarUser,
  registerWebinar,
  unregisterWebinar,
} from "@/controller/webinar-series.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(asnMiddleware)
  .patch(registerWebinar)
  .delete(unregisterWebinar);

export default router.handler({});