import { getBezzetingJf } from "@/controller/bezzeting.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(getBezzetingJf);

export default router.handler();
