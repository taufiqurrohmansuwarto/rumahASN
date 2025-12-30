import { createRouter } from "next-connect";
import {
  getUsersWithPreferences,
  getUserPreferencesById,
} from "@/controller/rasn-naskah/preferences.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";

const router = createRouter();

router
  .use(auth)
  .use(asnNonAsnMiddleware)
  .get(async (req, res) => {
    const { userId } = req.query;

    // If userId is provided, get specific user's preferences
    if (userId) {
      return getUserPreferencesById(req, res);
    }

    // Otherwise, get all users with preferences
    return getUsersWithPreferences(req, res);
  });

export default router.handler({});
