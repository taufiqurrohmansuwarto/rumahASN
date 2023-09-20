import {
  googleEditInformation,
  googleInformation,
} from "@/controller/users.controller";
import auth from "@/middleware/auth.middleware";
import googleMiddleware from "@/middleware/google.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

// hanya khusus google middleware
router
  .use(auth)
  .use(googleMiddleware)
  .patch(googleEditInformation)
  .get(googleInformation);

export default router.handler();
