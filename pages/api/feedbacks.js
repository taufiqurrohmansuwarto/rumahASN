import {
  createFeedback,
  listFeedbacks,
} from "@/controller/feedbacks.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(listFeedbacks).post(createFeedbac);

export default router.handler({});
