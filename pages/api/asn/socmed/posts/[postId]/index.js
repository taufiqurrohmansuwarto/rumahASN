import { detailPost } from "@/controller/social-media.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(detailPost);

export default router.handler();