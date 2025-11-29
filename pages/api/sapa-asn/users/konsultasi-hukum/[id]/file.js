import { createRouter } from "next-connect";
import auth from "@/middleware/auth.middleware";
import asnMiddleware from "@/middleware/asn.middleware";
import { deleteUploadedFile } from "@/controller/sapa-asn/users/konsultasi-hukum.controller";

const router = createRouter();

router.use(auth).use(asnMiddleware).delete(deleteUploadedFile);

export default router.handler();

