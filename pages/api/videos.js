import { getLIstYoutubeBKDJatim } from "@/controller/vendor.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getLIstYoutubeBKDJatim);

export default router.handler({});
