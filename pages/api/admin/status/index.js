// router
import { createRouter } from "next-connect";
import { index } from "../../../../controller/status.controller";

const router = createRouter();

router.get(index);

export default router.handler();
