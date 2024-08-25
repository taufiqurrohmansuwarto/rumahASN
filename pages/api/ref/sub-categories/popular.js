import { popularSubCategory } from "@/controller/admin-sub-categories.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(popularSubCategory);

export default router.handler();
