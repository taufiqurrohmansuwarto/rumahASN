import {
  IconFileAlert,
  IconFileCheck,
  IconFileDots,
  IconFileOff,
} from "@tabler/icons";
import stream from "stream";

import { toLower } from "lodash";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
dayjs.locale("id");

//

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return dayjs(date).format("DD-MM-YYYY HH:mm:ss");
};

export const formatDateSimple = (date) => {
  return dayjs(date).format("DD-MM-YYYY");
};

export const getParticipantName = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.username;
  } else {
    return user?.username;
  }
};

export const getParticipantEmployeeNumber = (user) => {
  if (user?.group === "GOOGLE") {
    return user?.info?.employee_number;
  } else {
    return user?.employee_number;
  }
};

// add role, batasi hanya untuk asn, pttpk, dan umum bukan untuk fasilitator di simaster atau pttpk
export const typeGroup = (group, role) => {
  if (toLower(group) === "master" && toLower(role) === "user") {
    return "asn";
  } else if (toLower(group) === "pttpk" && toLower(role) === "user") {
    return "non_asn";
  } else if (toLower(group) === "google") {
    return "umum";
  } else {
    return "fasilitator";
  }
};

export const uploadFileMinio = (mc, fileBuffer, filename, size, mimetype) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      "public",
      `${filename}`,
      fileBuffer,
      size,
      // cant be metadata add some username and department?
      { "Content-Type": mimetype },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

export const uploadFileMinioFput = (mc, fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    mc.fputObject("public", `${filename}`, fileBuffer, function (err, info) {
      if (err) {
        reject(err);
        console.log(err);
      } else {
        resolve(info);
      }
    });
  });
};

export const uploadFileWebinar = (mc, fileBuffer, filename, size, mimetype) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      "bkd",
      `${filename}`,
      fileBuffer,
      size,
      // cant be metadata add some username and department?
      { "Content-Type": mimetype },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

export const checkFileMinioSK = (mc, filename) => {
  return new Promise((resolve, reject) => {
    mc.statObject("bkd", filename, function (err, stat) {
      if (err) {
        if (err.code === "NotFound") {
          resolve(null);
        } else {
          reject(err);
        }
      } else {
        resolve(stat);
      }
    });
  });
};

export const uploadFileUsulan = (mc, filename, file) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      "public",
      `${filename}`,
      file.buffer,
      file.size,
      { "Content-Type": file.mimetype },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

export const downloadDokumenSK = async (mc, filename) => {
  const stream = await mc.getObject("bkd", `sk_pns/${filename}`);
  return stream;
};

export const searchAndDownloadFileSk = async (mc, nomorSurat) => {
  try {
    console.log(`Multi-pattern search for: ${nomorSurat}`);

    // Coba beberapa pattern prefix yang mungkin
    const prefixPatterns = [
      "sk_pns/SK_01072025_", // Berdasarkan screenshot
      "sk_pns/SK_02072025_",
      "sk_pns/SK_03072025_",
      "sk_pns/SK_30062025_",
      "sk_pns/SK_01062025_",
      // Tambahkan pattern lain sesuai kebutuhan
    ];

    for (const prefix of prefixPatterns) {
      console.log(`Trying prefix: ${prefix}`);

      const possibleFileName = `${prefix}${nomorSurat}.pdf`;

      try {
        // Cek apakah file ada
        await mc.statObject("bkd", possibleFileName);

        console.log(`Found file: ${possibleFileName}`);

        // Download file
        const stream = await mc.getObject("bkd", possibleFileName);
        const chunks = [];

        return new Promise((resolve, reject) => {
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("end", () => {
            const buffer = Buffer.concat(chunks);
            resolve({
              base64: buffer.toString("base64"),
              filename: possibleFileName.replace("sk_pns/", ""),
            });
          });
          stream.on("error", reject);
        });
      } catch (err) {
        if (err.code === "NotFound" || err.code === "NoSuchKey") {
          continue; // Coba pattern berikutnya
        }
        throw err;
      }
    }

    console.log(`No file found with any pattern for: ${nomorSurat}`);
    return null;
  } catch (err) {
    console.error("Error in searchWithMultiplePatterns:", err);
    throw err;
  }
};

export const downloadFileSK = (mc, filename) => {
  return new Promise((resolve, reject) => {
    mc.getObject("bkd", `${filename}`, function (err, dataStream) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        let fileBuffer = [];
        dataStream.on("data", function (chunk) {
          fileBuffer.push(chunk);
        });
        dataStream.on("end", function () {
          const chunks = Buffer.concat(fileBuffer);
          const base64 = Buffer.from(chunks).toString("base64");
          resolve(base64);
        });
      }
    });
  });
};

export const deleteFileMinio = (mc, filename) => {
  return new Promise((resolve, reject) => {
    mc.removeObject("public", `${filename}`, function (err, info) {
      if (err) {
        reject(err);
        console.log(err);
      } else {
        resolve(info);
      }
    });
  });
};

export const uploadSertifikatToMinio = (mc, filename, base64Pdf) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      "public",
      `/certificates/${filename}`,
      Buffer.from(base64Pdf, "base64"),
      base64Pdf.length,
      { "Content-Type": "application/pdf" },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

export const uploadDokumenSiasnToMinio = async (mc, filename, arrayBuffer) => {
  try {
    const buffer = Buffer.from(arrayBuffer);
    const readableStream = new stream.PassThrough();
    readableStream.end(buffer);

    const info = await mc.putObject(
      "bkd",
      `sk_pns/${filename}`,
      readableStream,
      buffer.length,
      { "Content-Type": "application/pdf" }
    );

    return info;
  } catch (err) {
    console.error("Error saat mengunggah ke MinIO:", err);
    throw err; // Melempar error agar bisa ditangkap di tempat pemanggilan
  }
};

export const uploadMinioWithFolder = (mc, filename, base64Pdf, folder) => {
  return new Promise((resolve, reject) => {
    mc.putObject(
      folder,
      `${filename}`,
      Buffer.from(base64Pdf, "base64"),
      base64Pdf.length,
      { "Content-Type": "application/pdf" },
      function (err, info) {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve(info);
        }
      }
    );
  });
};

export const fromNow = (date) => {
  return dayjs(date).fromNow();
};

// add break line before and after image tag
export const resizeImageTag = (text) => {
  return text.replace(/<img/g, "<br><img").replace(/\/>/g, "/><br>");
};

// convert html to text
export const removeHtmlTags = (text) => {
  return text.replace(/<[^>]*>?/gm, "");
};

export const colorTag = (tag) => {
  switch (tag) {
    case "DIAJUKAN":
      return "yellow";
    case "DIKERJAKAN":
      return "blue";
    case "SELESAI":
      return "green";
    default:
      return "red";
  }
};

export const setActivePekerjaan = (data) => {
  if (data?.created_at && data?.start_work_at && data?.completed_at) {
    return 2;
  } else if (data?.created_at && data?.start_work_at) {
    return 1;
  } else {
    return 0;
  }
};

export const notificationText = ({ type, role, type_id }) => {
  let currentRole = "";
  let currentType = "";

  if (role === "requester") {
    currentRole = "/tickets";
  } else if (role === "admin") {
    currentRole = "/admin/tickets-managements";
  } else if (role === "agent") {
    currentRole = "/agent/tickets";
  }

  if (type === "feedback") {
    currentType = "/detail";
  } else if (type === "ticket_done") {
    currentType = "/detail";
  } else if (type === "ticket_status_change") {
    currentType = "/detail";
  } else if (type === "chats_customer_to_agent") {
    currentType = "/chats-customers";
  } else if (type === "chats_agent_to_customer") {
    currentType = "/chats-to-agents";
  }

  return `${currentRole}/${type_id}${currentType}`;
};

export const statusTicket = (status) => {
  switch (status) {
    case "DIAJUKAN":
      return "info";
    case "DIKERJAKAN":
      return "warning";
    case "SELESAI":
      return "success";
    default:
      return "error";
  }
};

export const listDataDashboard = [
  { name: "DIAJUKAN", color: "yellow", icon: IconFileDots },
  { name: "DIKERJAKAN", color: "blue", icon: IconFileAlert },
  { name: "SELESAI", color: "green", icon: IconFileCheck },
  { name: "DITOLAK", color: "red", icon: IconFileOff },
];

// if undefined return empty string
export const checkUndefined = (data) => {
  if (data === undefined || data === null) {
    return "";
  } else {
    return data;
  }
};

export const cutMarkdown = (text) => {
  return text.substring(0, 200) + "...";
};

export const predikatAngkaKredit = [
  { label: "Pemula", kode: "PM", predikat: "SANGAT BAIK", value: 5.63 },
  { label: "Pemula", kode: "PM", predikat: "BAIK", value: 3.75 },
  { label: "Pemula", kode: "PM", predikat: "BUTUH PERBAIKAN", value: 2.81 },
  { label: "Pemula", kode: "PM", predikat: "KURANG", value: 1.88 },
  { label: "Pemula", kode: "PM", predikat: "SANGAT KURANG", value: 0.94 },

  { label: "Terampil", kode: "TR", predikat: "SANGAT BAIK", value: 7.5 },
  { label: "Terampil", kode: "TR", predikat: "BAIK", value: 5 },
  { label: "Terampil", kode: "TR", predikat: "BUTUH PERBAIKAN", value: 3.75 },
  { label: "Terampil", kode: "TR", predikat: "KURANG", value: 2.5 },
  { label: "Terampil", kode: "TR", predikat: "SANGAT KURANG", value: 1.25 },

  { label: "Mahir", kode: "MH", predikat: "SANGAT BAIK", value: 18.75 },
  { label: "Mahir", kode: "MH", predikat: "BAIK", value: 12.5 },
  { label: "Mahir", kode: "MH", predikat: "BUTUH PERBAIKAN", value: 9.38 },
  { label: "Mahir", kode: "MH", predikat: "KURANG", value: 6.25 },
  { label: "Mahir", kode: "MH", predikat: "SANGAT KURANG", value: 3.13 },

  { label: "Penyelia", kode: "PY", predikat: "SANGAT BAIK", value: 37.5 },
  { label: "Penyelia", kode: "PY", predikat: "BAIK", value: 25 },
  { label: "Penyelia", kode: "PY", predikat: "BUTUH PERBAIKAN", value: 18.75 },
  { label: "Penyelia", kode: "PY", predikat: "KURANG", value: 12.5 },
  { label: "Penyelia", kode: "PY", predikat: "SANGAT KURANG", value: 6.25 },

  { label: "Ahli Pertama", kode: "PT", predikat: "SANGAT BAIK", value: 18.75 },
  { label: "Ahli Pertama", kode: "PT", predikat: "BAIK", value: 12.5 },
  {
    label: "Ahli Pertama",
    kode: "PT",
    predikat: "BUTUH PERBAIKAN",
    value: 9.38,
  },
  { label: "Ahli Pertama", kode: "PT", predikat: "KURANG", value: 6.25 },
  { label: "Ahli Pertama", kode: "PT", predikat: "SANGAT KURANG", value: 3.13 },

  { label: "Ahli Muda", kode: "MU", predikat: "SANGAT BAIK", value: 37.5 },
  { label: "Ahli Muda", kode: "MU", predikat: "BAIK", value: 25 },
  { label: "Ahli Muda", kode: "MU", predikat: "BUTUH PERBAIKAN", value: 18.75 },
  { label: "Ahli Muda", kode: "MU", predikat: "KURANG", value: 12.5 },
  { label: "Ahli Muda", kode: "MU", predikat: "SANGAT KURANG", value: 6.25 },

  { label: "Ahli Madya", kode: "MA", predikat: "SANGAT BAIK", value: 56.25 },
  { label: "Ahli Madya", kode: "MA", predikat: "BAIK", value: 37.5 },
  {
    label: "Ahli Madya",
    kode: "MA",
    predikat: "BUTUH PERBAIKAN",
    value: 28.13,
  },
  { label: "Ahli Madya", kode: "MA", predikat: "KURANG", value: 18.75 },
  { label: "Ahli Madya", kode: "MA", predikat: "SANGAT KURANG", value: 9.38 },

  { label: "Ahli Utama", kode: "UT", predikat: "SANGAT BAIK", value: 75 },
  { label: "Ahli Utama", kode: "UT", predikat: "BAIK", value: 50 },
  { label: "Ahli Utama", kode: "UT", predikat: "BUTUH PERBAIKAN", value: 37.5 },
  { label: "Ahli Utama", kode: "UT", predikat: "KURANG", value: 25 },
  { label: "Ahli Utama", kode: "UT", predikat: "SANGAT KURANG", value: 12.5 },
];

export const dataAngkaKreditKonversi = [
  { label: "Pemula - Sangat Kurang (0.94)", value: 0.94 },
  { label: "Terampil - Sangat Kurang (1.25)", value: 1.25 },
  { label: "Pemula - Kurang (1.88)", value: 1.88 },
  { label: "Terampil - Kurang (2.5)", value: 2.5 },
  { label: "Pemula - Butuh Perbaikan (2.81)", value: 2.81 },
  {
    label: "Ahli Pertama - Sangat Kurang, Mahir - Sangat Kurang (3.13)",
    value: 3.13,
  },
  { label: "Pemula - Baik, Terampil - Butuh Perbaikan (3.75)", value: 3.75 },
  { label: "Terampil - Baik (5)", value: 5 },
  { label: "Pemula - Sangat Baik (5.63)", value: 5.63 },
  {
    label:
      "Ahli Pertama - Kurang, Mahir - Kurang, Penyelia - Sangat Kurang (6.25)",
    value: 6.25,
  },
  { label: "Terampil - Sangat Baik (7.5)", value: 7.5 },
  {
    label: "Ahli Pertama - Butuh Perbaikan, Mahir - Butuh Perbaikan (9.38)",
    value: 9.38,
  },
  {
    label:
      "Ahli Pertama - Baik, Ahli Muda - Kurang, Mahir - Baik, Penyelia - Butuh Perbaikan (12.5)",
    value: 12.5,
  },
  {
    label:
      "Ahli Pertama - Sangat Baik, Ahli Muda - Butuh Perbaikan, Ahli Madya - Kurang, Mahir - Sangat Baik, Penyelia - Baik (18.75)",
    value: 18.75,
  },
  {
    label: "Ahli Muda - Baik, Ahli Utama - Kurang, Penyelia - Sangat Baik (25)",
    value: 25,
  },
  { label: "Ahli Madya - Butuh Perbaikan (28.13)", value: 28.13 },
  {
    label: "Ahli Muda - Sangat Baik, Ahli Madya - Baik, Penyelia - Baik (37.5)",
    value: 37.5,
  },
  { label: "Ahli Utama - Baik (50)", value: 50 },
  { label: "Ahli Madya - Sangat Baik (56.25)", value: 56.25 },
  { label: "Ahli Utama - Sangat Baik (75)", value: 75 },
];

export const list_tmt = [
  "01042024",
  "01052024",
  "01062024",
  "01072024",
  "01082024",
  "01012025",
  "01062025",
  "01072025",
];

export const dokumen = ["SK", "PERTEK", "SPMT", "PK"];

export const checkJenjangPendidikanSIASN = (jenjangIdSIASN) => {
  // Mapping jenjang pendidikan SIASN ke nilai numerik
  const jenjangMapping = {
    50: 10,
    45: 9,
    40: 8,
    35: 7,
    30: 6,
  };

  return jenjangMapping[jenjangIdSIASN] || null;
};
