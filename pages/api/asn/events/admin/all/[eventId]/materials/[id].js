import {
  deleteEventMaterials,
  getEventMaterial,
  updateEventMaterials,
} from "@/controller/event-materials.controller";
import adminFasilitatorMiddleware from "@/middleware/admin-fasilitator.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(adminFasilitatorMiddleware)
  .patch(updateEventMaterials)
  .delete(deleteEventMaterials)
  .get(getEventMaterial);

export default router.handler();
