import { addVote, getVotes } from "@/controller/pocasts-votes.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getVotes).post(addVote);

export default router.handler({});
