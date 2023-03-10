import { get, remove, update } from "@/controller/saved-replies.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(get).patch(update).delete(remove);

export default router.handler({});
