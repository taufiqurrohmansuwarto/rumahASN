import {
  addParticipant,
  removeParticipant,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).delete(removeParticipant);

export default router.handler();
