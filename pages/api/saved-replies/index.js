import { create, list } from "@/controller/saved-replies.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(list).post(create);

export default router.handler({});
