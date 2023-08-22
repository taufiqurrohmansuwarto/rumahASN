import { readPollUser } from "@/controller/polls.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(readPollUser);

export default router.handler({});
