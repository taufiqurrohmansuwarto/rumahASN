import { pinned, unPinned } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).put(pinned).delete(unPinned);

export default router.handler();
