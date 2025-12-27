import { getDocumentActivities } from "@/controller/rasn-naskah/documents.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getDocumentActivities);

export default router.handler({});

