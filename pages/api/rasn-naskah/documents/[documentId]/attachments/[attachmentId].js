import { deleteAttachment } from "@/controller/rasn-naskah/upload.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).delete(deleteAttachment);

export default router.handler({});

