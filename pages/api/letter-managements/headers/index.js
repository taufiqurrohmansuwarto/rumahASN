import {
  createHeaderSurat,
  findHeaderSurat,
} from "@/controller/persuratan.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import { auth } from "middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .get(findHeaderSurat)
  .post(createHeaderSurat);

export default router.handler();
