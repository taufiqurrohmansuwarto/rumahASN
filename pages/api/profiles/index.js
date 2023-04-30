import {
  getOwnProfile,
  updateOwnProfile,
} from "@/controller/profile.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getOwnProfile).patch(updateOwnProfile);

export default router.handler({});
