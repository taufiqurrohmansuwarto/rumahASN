import { syncBezzetingJf } from "@/controller/bezzeting.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(syncBezzetingJf);

export default router.handler();
