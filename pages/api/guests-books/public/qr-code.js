import { findByQrCode } from "@/controller/guests-books.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.post(findByQrCode);

export default router.handler({});
