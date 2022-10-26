import { createRouter } from "next-connect";
import { listBanner } from "../../controller/vendor.controller";
import auth from "../../middleware/auth.middleware";
const router = createRouter();

router.use(auth).get(listBanner);

export default router.handler({});
