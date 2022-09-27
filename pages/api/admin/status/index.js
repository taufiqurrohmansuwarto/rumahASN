// router
import { createRouter } from "next-connect";
import { index } from "../../../../controller/status.controller";
import auth from "../../../../middleware/auth.middleware";
import onlyBkd from "../../../../middleware/bkd.middleware";

const router = createRouter();

router.use(auth).use(onlyBkd).get(index);

export default router.handler();
