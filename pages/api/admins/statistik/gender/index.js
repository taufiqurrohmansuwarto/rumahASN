import adminMiddleware from "@/middleware/admin.middleware";
import auth from "middleware/auth.middleware";
import { createRouter } from "next-connect";
import multer from "multer";
import {
  getStatistikASNGender,
  uploadStatistikASNGender,
} from "@/controller/statistik/statistik-asn.controller";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

const router = createRouter();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file Excel (.xlsx, .xls) yang diperbolehkan"));
    }
  },
});

router
  .use(auth)
  .use(adminMiddleware)
  .get(getStatistikASNGender)
  .post(upload.single("file"), uploadStatistikASNGender);

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || "Internal server error" });
  },
});
