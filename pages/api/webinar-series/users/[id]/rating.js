import { createRating } from "@/controller/webinar-series-ratings.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).post(createRating);

export default router.handler({});
