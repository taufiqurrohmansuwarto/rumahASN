import auth from "@/middleware/auth.middleware";
import onlyBkd from "@/middleware/bkd.middleware";
import multer from "multer";
import { createRouter } from "next-connect";
import { create, findAll } from "@/controller/esign/esign-documents.controller";

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

const router = createRouter();

router.use(auth).use(onlyBkd).get(findAll).post(upload.single("file"), create);

export default router.handler({
  onError: (err, req, res) => {
    console.error("API Error:", err.stack);
    res.status(500).json({
      message: err.message || "Something went wrong!",
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({
      message: `Method '${req.method}' Not Allowed`,
    });
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
