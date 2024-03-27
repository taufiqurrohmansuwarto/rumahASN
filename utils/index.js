import {
  IconFileAlert,
  IconFileCheck,
  IconFileDots,
  IconFileOff,
} from "@tabler/icons";

import { toLower } from "lodash";
import moment from "moment";

//

// change date format to DD-MM-YYYY
export const formatDate = (date) => {
  return moment(date).format("DD-MM-YYYY HH:mm:ss");
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
        console.log(err);
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
