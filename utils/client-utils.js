import moment from "moment";
import "moment/locale/id";
import { uploadFiles, parseMarkdown } from "@/services/index";
// language is set to Indonesia
moment.locale("id");

export const formatDateFromNow = (date) => {
  // language is set to Indonesia
  return moment(date).locale("id").fromNow();
};

export const formatedMonth = (date) => {
  // language is set to Indonesia
  return moment(date).locale("id").format("MMMM");
};

export const capitalizeWithoutPPPK = (str) => {
  let words = str.toLowerCase().split(" ");
  for (let i = 0; i < words.length; i++) {
    if (words[i] !== "pppk") {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
    }
  }
  return words.join(" ");
};

export const formatTooltipUsers = (currentUsers, users) => {
  const newUsers = users?.map((user) => ({
    ...user,
    id: user?.id,
    username: user?.id === currentUsers ? "Kamu" : user?.username,
  }));
  // if more 1, show 1
  // if more 2, show 1 and 2
  // if more 3, show 1, 2 and 3
  // if more 4, show 1, 2, 3 and 4
  // if more 5, show 1, 2, 3 and 2 more

  if (newUsers?.length === 1) {
    return newUsers[0]?.username;
  } else if (newUsers?.length === 2) {
    return `${newUsers[0]?.username} dan ${newUsers[1]?.username} bereaksi emoji ini`;
  } else if (newUsers?.length === 3) {
    return `${newUsers[0]?.username}, ${newUsers[1]?.username} dan ${newUsers[2]?.username} bereaksi emoji ini`;
  } else if (newUsers?.length === 4) {
    return `${newUsers[0]?.username}, ${newUsers[1]?.username}, ${newUsers[2]?.username} dan ${newUsers[3]?.username} bereaksi emoji ini`;
  } else {
    return `${newUsers[0]?.username}, ${newUsers[1]?.username}, ${
      newUsers[2]?.username
    } dan ${newUsers?.length - 3} yang lain bereaksi emoji ini`;
  }
};

export const formatDateLL = (data) => {
  //  return Sep, 24 2021
  return moment(data).format("DD, MMM YYYY", { locale: "id" });
};

const allUser = ["admin", "agent", "user"];
const noAdmin = ["agent", "user"];
const noUser = ["admin", "agent"];

const user = ["user"];
const agent = ["agent"];

export const definitions = {
  permissions: {
    "create-ticket": {
      roles: allUser,
      displayName: "Create Ticket",
      description: "To create new ticket",
    },
    "advanced-filter": {
      roles: noUser,
      displayName: "Advanced Filter",
      description: "To use advanced filter",
    },
    "edit-comment": {
      roles: allUser,
      displayName: "Create Own Comment",
      description: "To create own comment",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.comment?.user_id;
        },
        requiredRoles: allUser,
      },
    },
    "remove-comment": {
      roles: allUser,
      displayName: "Remove Own Comment",
      description: "To remove own comment",
      attributeCheck: {
        checkFunction: (attributes) =>
          attributes?.user?.id === attributes?.comment?.user_id,
        requiredRoles: noAdmin,
      },
    },
    "create-comment": {
      roles: allUser,
      displayName: "Create Own Comment",
      description: "To create own comment",
      modelCheck: {
        model: "ticket",
        checkFunction: (model, attributes, user) => {
          if (model === "ticket") {
            return (
              (attributes?.ticket?.is_published &&
                !attributes?.ticket?.is_locked) ||
              (user?.id === attributes?.ticket?.requester &&
                !attributes?.ticket?.is_locked) ||
              user?.id === attributes?.ticket?.assignee
            );
          }
          return true;
        },
        requiredRoles: noAdmin,
      },
    },
    "mark-answer": {
      roles: noUser,
      displayName: "Mark Answer",
      description: "To mark answer",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.agent?.custom_id;
        },
        requiredRoles: agent,
      },
    },
    "edit-ticket-title": {
      roles: allUser,
      displayName: "Edit Ticket",
      description: "To edit ticket",
      attributeCheck: {
        checkFunction: (attributes) => {
          return (
            attributes?.user?.id === attributes?.ticket?.requester ||
            attributes?.user?.id === attributes?.ticket?.assignee
          );
        },
        requiredRoles: noAdmin,
      },
    },
    "edit-ticket-description": {
      roles: allUser,
      displayName: "Edit Ticket Description",
      description: "To edit ticket description",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.requester;
        },
        requiredRoles: allUser,
      },
    },
    "options-ticket": {
      roles: ["admin", "agent"],
      displayName: "Options Ticket",
      description: "To see options ticket",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.assignee;
        },
        requiredRoles: ["agent"],
      },
    },
    "update-feedback": {
      roles: allUser,
      displayName: "Update Feedback",
      description: "To update feedback",
      attributeCheck: {
        checkFunction: (attributes) =>
          attributes?.user?.id === attributes?.user_id,
        requiredRoles: user,
      },
    },
    "see-feedback": {
      roles: user,
      displayName: "See Feedback",
      description: "To see feedback",
    },
    "change-priority-kategory": {
      roles: noUser,
      displayName: "Change Priority Kategory",
      description: "To change priority kategory",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.assignee;
        },
        requiredRoles: ["agent"],
      },
    },
    "reminder-ticket": {
      roles: noUser,
      displayName: "Reminder Ticket",
      description: "To reminder ticket",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.assignee;
        },
        requiredRoles: ["agent"],
      },
    },
    "change-status": {
      roles: noUser,
      displayName: "Change Status",
      description: "To change status",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.assignee;
        },
        requiredRoles: ["agent"],
      },
    },
    "change-agent": {
      roles: ["admin"],
      displayName: "to change agent",
      description: "To change agent",
    },
    "submit-feedback": {
      roles: allUser,
      displayName: "submit feedback",
      description: "To submit feedback",
      attributeCheck: {
        checkFunction: (attributes) => {
          return attributes?.user?.id === attributes?.ticket?.requester;
        },
        requiredRoles: allUser,
      },
    },
  },
};

export const setColorStatus = (status) => {
  if (status === "DIAJUKAN") {
    return "#FFC107";
  } else if (status === "SELESAI") {
    return "#00FF00";
  } else if (status === "DIKERJAKAN") {
    return "#0000FF";
  } else {
    return "#000";
  }
};

export const setColorPrioritas = (prioritas) => {
  if (prioritas === "RENDAH") {
    return "#00FF00";
  } else if (prioritas === "SEDANG") {
    return "#FFC107";
  } else if (prioritas === "TINGGI") {
    return "#FF0000";
  } else {
    return "#000";
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadFiles(formData);
    return {
      url: result?.data,
      file,
    };
  } catch (error) {
    console.log(error);
  }
};

export const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

// create custom function from html if there is a tag add new blank target
export const transformHref = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const links = doc.querySelectorAll("a");
  links.forEach((link) => {
    link.setAttribute("target", "_blank");
  });
  return doc.body.innerHTML;
};

// create custom function is date is not three days ago and retrun true
export const isNotThreeDaysAgo = (date) => {
  return moment(date).isAfter(moment().subtract(5, "days"));
};

export const stringToNumber = (string) => {
  return parseInt(string).toFixed(0);
};

export const cleanQuery = (query) => {
  const cleaned = {};
  for (const key in query) {
    if (query[key]) {
      cleaned[key] = query[key];
    }
  }
  return cleaned;
};

export const meetingType = [
  {
    value: 1,
    label: "Instant Meeting",
  },
  {
    value: 2,
    label: "Scheduled Meeting",
  },
  {
    value: 3,
    label: "Recurring Meeting with no fixed time",
  },
  {
    value: 8,
    label: "Recurring Meeting with fixed time",
  },
];

export const formatTime = (seconds) => {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = pad(date.getUTCSeconds());
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`;
  }
  return `${mm}:${ss}`;
};

function pad(string) {
  return ("0" + string).slice(-2);
}

// create function like arrayToTree javascript
export const arrayToTree = (
  items,
  { curreProperty = "id", parentProperty = "parent_id" }
) => {
  return items.reduce((tree, item) => {
    const parent_id = item[parentProperty];
    const child = tree.find((child) => child[curreProperty] === parent_id);
    if (child) {
      child.children = [...(child.children || []), item];
    } else {
      tree.push(item);
    }
    return tree;
  }, []);
};

export const API_URL = "https://apimws.bkn.go.id:8243/apisiasn/1.0";

// buat fungsi pembanding teks
export const compareText = (text1, text2) => {
  return text1?.trim()?.toLowerCase() === text2.trim()?.toLowerCase();
};

const normalisasiGelar = (gelar) => {
  return gelar?.replace(/\./g, "")?.trim()?.toUpperCase();
};

export const komparasiGelar = (gelar1, gelar2) => {
  const result = normalisasiGelar(gelar1) === normalisasiGelar(gelar2);
  return result;
};

export const jenisRiwayat = (action) => {
  let result = "";

  if (action === "login") {
    result = "Anda masuk pada aplikasi";
  }
  if (action === "comment") {
    result = "Anda berkomentar";
  }
  return result;
};

// create time like gmail format using moment if today show time else show date with format like 3 Aug if year same show date with format like 3 Aug 2021
export const timeFormat = (date) => {
  if (moment(date).isSame(moment(), "day")) {
    return moment(date).format("HH:mm");
  }
  if (moment(date).isSame(moment(), "year")) {
    return moment(date).format("DD MMM");
  }
  return moment(date).format("DD/MM/YYYY");
};

// create  function take 20 character from html text and make it one line even is p tag and the rest is ...
export const truncate = (text, char = 20) => {
  const regex = /(<([^>]+)>)/gi;
  const result = text.replace(regex, "");
  return result?.substring(0, char) + "...";
};
