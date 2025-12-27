import { toggleBookmark } from "@/controller/rasn-naskah/documents.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).post(toggleBookmark);

export default router.handler({});

