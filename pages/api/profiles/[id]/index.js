import { detailUserProfile } from "@/controller/profile.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(detailUserProfile);

export default router.handler({});
