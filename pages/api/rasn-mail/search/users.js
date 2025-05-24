import asnNonAsnFasilitatorMiddleware from "@/middleware/asn-non-asn-fasilitator.middleware";
import { searchUsers } from "@/controller/rasn-mail/emails.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnFasilitatorMiddleware).get(searchUsers);

export default router.handler({});
