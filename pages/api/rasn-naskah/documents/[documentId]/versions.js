import { getDocumentVersions } from "@/controller/rasn-naskah/documents.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getDocumentVersions);

export default router.handler({});

