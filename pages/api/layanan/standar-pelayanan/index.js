import {
  createStandarPelayanan,
  findStandarPelayanan,
} from "@/controller/standar-pelayanan.controller";
import adminMiddleware from "@/middleware/admin.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .get(findStandarPelayanan)
  .use(auth)
  .use(adminMiddleware)
  .post(createStandarPelayanan);

export default router.handler();
