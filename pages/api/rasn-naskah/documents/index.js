import {
  getDocuments,
  createDocument,
} from "@/controller/rasn-naskah/documents.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getDocuments).post(createDocument);

export default router.handler({});

