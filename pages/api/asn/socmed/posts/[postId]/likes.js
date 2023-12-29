import { postLikes } from "@/controller/social-media.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(postLikes);

export default router.handler();
