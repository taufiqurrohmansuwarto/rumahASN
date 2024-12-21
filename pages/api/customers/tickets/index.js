import { createRouter } from "next-connect";
import { index, create } from "@/controller/users-ticket.controller";
import auth from "@/middleware/auth.middleware";

const router = createRouter();
router.use(auth).get(index).post(create);

export default router.handler({});
