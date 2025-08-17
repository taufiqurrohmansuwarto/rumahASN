import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import { likes } from "@/controller/knowledge/user-interactions.controller";

const router = createRouter();

router.use(auth).get(likes);

export default router.handler({});
