import { createRouter } from "next-connect";
import { auth } from "middleware/auth.middleware";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import {
  getHeaderSurat,
  deleteHeaderSurat,
} from "@/controller/persuratan.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(getHeaderSurat)
  .delete(deleteHeaderSurat);

export default router.handler();
