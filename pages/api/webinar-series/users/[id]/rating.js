import { createRating } from "@/controller/webinar-series-ratings.controller";
import auth from "@/middleware/auth.middleware";
import webinarUserTypeMiddleware from "@/middleware/webinar-user-type.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).use(webinarUserTypeMiddleware).post(createRating);

export default router.handler({});
