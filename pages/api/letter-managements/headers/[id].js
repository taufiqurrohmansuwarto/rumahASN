import { createRouter } from "next-connect";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import {
  getHeaderSurat,
  deleteHeaderSurat,
  updateHeaderSurat,
} from "@/controller/persuratan.controller";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateHeaderSurat)
  .get(getHeaderSurat)
  .delete(deleteHeaderSurat);

export default router.handler();
