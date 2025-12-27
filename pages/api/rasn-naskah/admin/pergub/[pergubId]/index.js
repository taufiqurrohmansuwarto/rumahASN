import {
  getPergub,
  updatePergub,
  deletePergub,
} from "@/controller/rasn-naskah/admin.controller";
import auth from "@/middleware/auth.middleware";
import adminMiddleware from "@/middleware/admin.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminMiddleware)
  .get(getPergub)
  .patch(updatePergub)
  .delete(deletePergub);

export default router.handler({});

