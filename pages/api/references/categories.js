import { categories } from "@/controller/references.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(categories);

export default router.handler({});
