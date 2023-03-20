import { addCommentsReactions } from "@/controller/comments-reactions.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).put(addCommentsReactions);

module.exports = router.handler({});
