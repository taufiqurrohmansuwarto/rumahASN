import {
  requestReview,
  getDocumentReviews,
} from "@/controller/rasn-naskah/reviews.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getDocumentReviews).post(requestReview);

export default router.handler({});

