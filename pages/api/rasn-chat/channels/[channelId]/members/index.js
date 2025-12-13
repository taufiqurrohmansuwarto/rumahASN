import {
  getChannelMembers,
  inviteMember,
} from "@/controller/rasn-chat.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(getChannelMembers)
  .post(inviteMember);

export default router.handler({});

