import {
  getDocument,
  updateDocument,
  deleteDocument,
} from "@/controller/rasn-naskah/documents.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getDocument).patch(updateDocument).delete(deleteDocument);

export default router.handler({});

