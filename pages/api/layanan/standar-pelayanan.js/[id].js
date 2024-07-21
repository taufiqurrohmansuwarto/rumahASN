import { findStandarPelayananById } from "@/controller/standar-pelayanan.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(findStandarPelayananById);

export default router.handler();
