import { usersMentions } from "@/controller/mentions.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(usersMentions);

export default router.handler({});
