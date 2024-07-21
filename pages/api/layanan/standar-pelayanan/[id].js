import {
  deleteStandarPelayanan,
  findStandarPelayananById,
  updateStandarPelayanan,
} from "@/controller/standar-pelayanan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .get(findStandarPelayananById)
  .use(auth)
  .use(adminMiddleware)
  .patch(updateStandarPelayanan)
  .delete(deleteStandarPelayanan);

export default router.handler();
