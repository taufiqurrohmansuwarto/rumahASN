import {
  createComment,
  getComments,
  getCommentsHierarchical,
} from "@/controller/knowledge/user-interactions.controller";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

// Handler untuk route yang berbeda berdasarkan query parameter
const handleGet = async (req, res) => {
  // Jika ada query parameter 'hierarchical=true', gunakan getCommentsHierarchical
  if (req.query.hierarchical === 'true') {
    return getCommentsHierarchical(req, res);
  }
  // Default menggunakan getComments biasa
  return getComments(req, res);
};

router.use(auth).use(asnNonAsnMiddleware).post(createComment).get(handleGet);

export default router.handler({});
