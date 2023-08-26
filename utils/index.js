import {
  IconFileAlert,
  IconFileCheck,
  IconFileDots,
  IconFileOff,
} from "@tabler/icons";
import axios from "axios";
import {
  pipe,
  gotenberg,
  convert,
  office,
  to,
  landscape,
  set,
  filename,
  please,
  adjust,
} from "gotenberg-js-client";
import { toLower } from "lodash";
import moment from "moment";
const https = require("https");

const { TemplateHandler, MimeType } = require("easy-template-x");

const GOTENBERG_URL = process.env.GOTENBERG_URL;

const toPDF = pipe(
  gotenberg(""),
  convert,
  office,
  adjust({
    url: GOTENBERG_URL,
  }),
  please
);

//
export const wordToPdf = async (url, user) => {
  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "utf-8");
    const handler = new TemplateHandler();

    const data = {
      nama: user?.username,
      jabatan: user?.info?.jabatan?.jabatan,
      nip: user?.employee_number,
    };

    const doc = await handler.process(buffer, data, MimeType.docx);

    const pdf = await toPDF({
      "document.docx": doc,
    });

    return pdf;
  } catch (error) {
    console.log(error);
  }
};

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY HH:mm:ss");
};

export const typeGroup = (group) => {
  if (toLower(group) === "master") {
    return "asn";
  } else if (toLower(group) === "pttpk") {
    return "non_asn";
  } else {
    return "umum";
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

export const fromNow = (date) => {
  return moment(date).fromNow();
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
