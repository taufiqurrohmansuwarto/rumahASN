import { checkUserByNik, signPdfWithPassphrase } from "@/utils/esign";
import { uploadMinioWithFolder } from "@/utils/index";
import { signAndSaveQueue } from "@/utils/queue";
const ESIGN_NIK = process.env.ESIGN_NIK;
const iput = "199103052019031008";
import axios from "axios";

const data = [
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_1.pdf",
    name: "doc_1.pdf",
  },
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_2.pdf",
    name: "doc_2.pdf",
  },
  {
    url: "https://siasn.bkd.jatimprov.go.id:9000/public/doc_3.pdf",
    name: "doc_3.pdf",
  },
];

export const check = async (req, res) => {
  try {
    const { employee_number: employeeNumber } = req?.user;
    let nik = "";

    if (employeeNumber === iput) {
      nik = ESIGN_NIK;
    } else {
      nik = "";
    }

    const result = await checkUserByNik(nik);
    res.json(result?.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong, please try again later." });
  }
};

export const signPdf = async (req, res) => {
  try {
    const { passphrase } = req.body;
    const { employee_number: employeeNumber } = req?.user;
    let nik = "";

    if (employeeNumber === iput) {
      nik = ESIGN_NIK;
    } else {
      nik = "";
    }

    const jobs = data.map((item) => {
      const data = {
        url: item?.url,
        name: item?.name,
        nik,
        passphrase: passphrase.trim(),
      };
      signAndSaveQueue.add(data);
    });

    await Promise.all(jobs);

    res.json({ success: true });
  } catch (error) {
    console.log("error", error);
    const message = error?.error || "Something went wrong";
    res.status(500).json({ message });
  }
};

export const status = async (req, res) => {
  const result = await signAndSaveQueue.getJobCounts();
  res.json(result);
};
