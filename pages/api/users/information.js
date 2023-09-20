import {
  getUserInformation,
  googleEditInformation,
} from "@/controller/users.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

// hanya khusus google middleware
router.use(auth).patch(googleEditInformation).get(getUserInformation);

export default router.handler();
