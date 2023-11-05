import {
  createMeeting,
  findMeeting,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import ccConsultantMiddleware from "@/middleware/cc-consultant.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router
  .use(auth)
  .use(ccConsultantMiddleware)
  .get(findMeeting)
  .post(createMeeting);

export default router.handler();
