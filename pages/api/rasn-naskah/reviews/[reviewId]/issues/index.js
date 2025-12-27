import { getReviewIssues } from "@/controller/rasn-naskah/reviews.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getReviewIssues);

export default router.handler({});

