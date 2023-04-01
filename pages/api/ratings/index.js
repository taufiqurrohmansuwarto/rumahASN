import {
  closeModalRatings,
  giveRatings,
  showModalRatings,
} from "@/controller/ratings.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .get(showModalRatings)
  .post(giveRatings)
  .delete(closeModalRatings);

export default router.handler();
