import {
  getNotula,
  updateNotula,
  sendNotulaToParticipants,
} from "@/controller/coaching-clinic.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// GET: Ambil notula
// PATCH: Update/simpan notula
// POST: Kirim notula ke peserta via rasn_mail
router
  .use(auth)
  .get(getNotula)
  .patch(updateNotula)
  .post(sendNotulaToParticipants);

export default router.handler();
