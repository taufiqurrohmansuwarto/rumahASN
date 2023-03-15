import { publish, unPublish } from "@/controller/tickets-props.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).put(publish).delete(unPublish);

export default router.handler();
