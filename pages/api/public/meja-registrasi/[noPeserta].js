import { findMejaRegistrasi } from "@/controller/meja-registrasi.controller";
import { createRouter } from "next-connect";

const router = createRouter();

router.get(findMejaRegistrasi);

module.exports = router.handler();
