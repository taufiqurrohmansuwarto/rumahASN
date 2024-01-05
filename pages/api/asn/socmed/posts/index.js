import { createPost, posts } from "@/controller/social-media.controller";
import asnMiddleware from "@/middleware/asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(asnMiddleware).get(posts).post(createPost);

export default router.handler();
