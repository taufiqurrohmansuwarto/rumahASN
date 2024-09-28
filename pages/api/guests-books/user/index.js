import { getGuests, updateGuest } from "@/controller/guests-books.controller";
import auth from "@/middleware/auth.middleware";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(auth).get(getGuests).patch(updateGuest);

export default router.handler({});
