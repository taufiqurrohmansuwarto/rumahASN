import {
  addCommentsReactions,
  removeCommentsReactions,
} from "@/controller/comments-reactions.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).patch(addCommentsReactions).put(removeCommentsReactions);

module.exports = router.handler({});
