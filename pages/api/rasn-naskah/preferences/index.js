import {
  getPreferences,
  updatePreferences,
} from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(getPreferences)
  .put(updatePreferences)
  .patch(updatePreferences); // Also support PATCH method

export default router.handler({});

