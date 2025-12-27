import { getReviewStatus } from "@/controller/rasn-naskah/reviews.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getReviewStatus);

export default router.handler({});

