import { readPollUser, votePolling } from "@/controller/polls.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(readPollUser).patch(votePolling);

export default router.handler({});
