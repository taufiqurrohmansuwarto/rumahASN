import { getRefUrusanPemerintahan } from "@/controller/siasn.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";
const router = createRouter();

router.use(auth).get(getRefUrusanPemerintahan);

export default router.handler();
