import { cancelReview } from "@/controller/rasn-naskah/reviews.controller";
import auth from "@/middleware/auth.middleware";
import asnNonAsnMiddleware from "@/middleware/asn-non-asn.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).use(asnNonAsnMiddleware).post(cancelReview);

export default router.handler({});
