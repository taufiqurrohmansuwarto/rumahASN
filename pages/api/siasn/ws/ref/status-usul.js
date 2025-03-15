import { getStatusUsul } from "@/controller/rekon/rekon-status-usul.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getStatusUsul);

export default router.handler({});
