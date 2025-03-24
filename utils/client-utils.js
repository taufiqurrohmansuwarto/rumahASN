import { parseMarkdown, uploadFiles } from "@/services/index";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Icon123,
  IconArrowFork,
  IconArrowsExchange,
  IconBadge,
  IconBadges,
  IconBriefcase,
  IconCashBanknote,
  IconClipboardData,
  IconClock,
  IconFileCertificate,
  IconReport,
  IconSchool,
  IconUser,
  IconUserExclamation,
  IconUserPlus,
  IconUserSearch,
  IconUsers,
} from "@tabler/icons";
import { Tag } from "antd";
import { toLower } from "lodash";

import { getTokenSIASNService } from "@/services/siasn-services";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import queryString from "query-string";

dayjs.extend(relativeTime);
dayjs.locale("id");

const REF_PANGKAT = [
  { id: "11", nama: "I/a", nama_pangkat: "Juru Muda" },
  { id: "12", nama: "I/b", nama_pangkat: "Juru Muda Tingkat I" },
  { id: "13", nama: "I/c", nama_pangkat: "Juru" },
  { id: "14", nama: "I/d", nama_pangkat: "Juru Tingkat I" },
  { id: "21", nama: "II/a", nama_pangkat: "Pengatur Muda" },
  { id: "22", nama: "II/b", nama_pangkat: "Pengatur Muda Tingkat I" },
  { id: "23", nama: "II/c", nama_pangkat: "Pengatur" },
  { id: "24", nama: "II/d", nama_pangkat: "Pengatur Tingkat I" },
  { id: "31", nama: "III/a", nama_pangkat: "Penata Muda" },
  { id: "32", nama: "III/b", nama_pangkat: "Penata Muda Tingkat I" },
  { id: "33", nama: "III/c", nama_pangkat: "Penata" },
  { id: "34", nama: "III/d", nama_pangkat: "Penata Tingkat I" },
  { id: "41", nama: "IV/a", nama_pangkat: "Pembina" },
  { id: "42", nama: "IV/b", nama_pangkat: "Pembina Tingkat I" },
  { id: "43", nama: "IV/c", nama_pangkat: "Pembina Utama Muda" },
  { id: "44", nama: "IV/d", nama_pangkat: "Pembina Utama Madya" },
  { id: "45", nama: "IV/e", nama_pangkat: "Pembina Utama" },
];

export const mysapkMenu = [
  {
    title: "Data Utama",
    icon: IconUserSearch,
    color: "violet",
    path: "/data-utama",
  },
  {
    title: "Ubah Biodata",
    icon: IconUserExclamation,
    color: "orange",
    path: "/ubah-data",
  },
  {
    title: "Pasangan",
    icon: IconUserPlus,
    color: "cyan",
    path: "/pasangan",
  },
  {
    title: "Jabatan",
    icon: IconBadge,
    color: "green",
    path: "/jabatan",
  },
  {
    title: "Usulan SIASN",
    icon: IconClipboardData,
    color: "green",
    path: "/usulan-siasn/inbox-usulan",
  },
  {
    title: "Angka Kredit",
    icon: Icon123,
    color: "green",
    path: "/angka-kredit",
  },
  {
    title: "Kinerja (SKP)",
    icon: IconCashBanknote,
    color: "yellow",
    path: "/laporan-kinerja",
  },
  {
    title: "Kompetensi",
    icon: IconUser,
    color: "green",
    path: "/rw-kompetensi",
  },
  {
    title: "Potensi",
    icon: IconUser,
    color: "yellow",
    path: "/rw-potensi",
  },
  {
    title: "Diklat/Kursus",
    icon: IconReport,
    color: "blue",
    path: "/diklat",
  },
  {
    title: "Pendidikan",
    icon: IconSchool,
    color: "gray",
    path: "/pendidikan",
  },

  {
    title: "Golongan/Pangkat",
    icon: IconBadges,
    color: "green",
    path: "/golongan",
  },

  {
    title: "Peninjauan Masa Kerja (PMK)",
    icon: IconClock,
    color: "gray",
    path: "/pmk",
  },
  // {
  //   title: "Keluarga",
  //   icon: IconUsers,
  //   color: "gray",
  //   path: "/keluarga",
  // },

  {
    title: "Penghargaan",
    icon: IconFileCertificate,
    color: "gray",
    path: "/penghargaan",
  },
  {
    title: "Kinerja Periodik",
    icon: IconArrowFork,
    color: "yellow",
    path: "/kinerja-periodik",
  },
  { title: "Riwayat CLTN", icon: IconBriefcase, color: "gray", path: "/cltn" },
  {
    title: "Hukuman Disiplin",
    icon: IconSchool,
    color: "gray",
    path: "/hukuman-disiplin",
  },
  {
    title: "Pindah Instansi",
    icon: IconArrowsExchange,
    color: "gray",
    path: "/pindah-instansi",
  },
];

export const StatusWebinar = ({ status }) => {
  if (status === "published") {
    return <Tag color="green">Published</Tag>;
  } else if (status === "draft") {
    return <Tag color="red">Draft</Tag>;
  }
};

export const participantType = (group) => {
  if (toLower(group) === "master") {
    return "asn";
  } else if (toLower(group) === "pttpk") {
    return "non_asn";
  } else {
    return "umum";
  }
};

export const formatDateFromNow = (date) => {
  // language is set to Indonesia
  return dayjs(date).fromNow();
};

export const formatDateWebinar = (date) => {
  return dayjs(date).format("DD MMM YYYY");
};

export const formatedMonth = (date) => {
  // language is set to Indonesia
  return dayjs(date).format("MMMM");
};

export const base64ToPdf = (base64) => {
  return `data:application/pdf;base64,${base64}`;
};

export const formatDateFull = (date) => {
  // language is set to Indonesia
  return dayjs(date).format("DD MMMM YYYY HH:mm");
};

export const formatDateSimple = (date) => {
  return dayjs(date).format("D MMM YYYY HH:mm");
};

export const capitalizeWords = (str) => {
  let words = str?.toLowerCase().split(" ");
  for (let i = 0; i < words?.length; i++) {
    words[i] = words?.[i]?.charAt(0)?.toUpperCase() + words[i]?.substring(1);
  }
  return words?.join(" ");
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
  return dayjs(data).format("DD, MMM YYYY");
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
    return "warning";
  } else if (status === "SELESAI") {
    return "success";
  } else if (status === "DIKERJAKAN") {
    return "processing";
  } else {
    return "#000";
  }
};

export const setColorStatusTooltip = (status) => {
  if (status === "DIAJUKAN") {
    return "orange";
  } else if (status === "SELESAI") {
    return "green";
  } else if (status === "DIKERJAKAN") {
    return "blue";
  } else {
    return "#000";
  }
};

export const setStatusIcon = (status) => {
  if (status === "DIAJUKAN") {
    return <SyncOutlined />;
  } else if (status === "SELESAI") {
    return <CheckCircleOutlined />;
  } else if (status === "DIKERJAKAN") {
    return <ClockCircleOutlined />;
  } else {
    return <ExclamationOutlined />;
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
  return dayjs(date).isAfter(dayjs().subtract(5, "days"));
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

export const uploadDokumenRiwayat = async (formData) => {
  try {
    const result = await getTokenSIASNService();
    const wso2 = result?.accessToken?.wso2;
    const sso = result?.accessToken?.sso;
    return axios.post(`${API_URL}/upload-dok-rw`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${wso2}`,
        Auth: `bearer ${sso}`,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// const normalize string
export const normalizeString = (str) => {
  return str?.trim().toUpperCase().replace(/'/g, "`").replace(/\s+/g, " "); // Mengganti spasi berturut-turut dengan satu spasi;
};

// buat fungsi pembanding teks
export const compareText = (text1, text2) => {
  const str1 = normalizeString(text1);
  const str2 = normalizeString(text2);
  return str1 === str2;
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
  if (dayjs(date).isSame(dayjs(), "day")) {
    return dayjs(date).format("HH:mm");
  }
  if (dayjs(date).isSame(dayjs(), "year")) {
    return dayjs(date).format("DD MMM");
  }
  return dayjs(date).format("DD/MM/YYYY");
};

// create  function take 20 character from html text and make it one line even is p tag and the rest is ... if less than 20 character return all text
export const truncate = (text, char = 20) => {
  const regex = /(<([^>]+)>)/gi;
  const result = text.replace(regex, "");
  return result?.substring(0, char) + "...";
};

export const participantColor = (group) => {
  if (group === "MASTER") {
    return "red";
  } else if (group === "PTPK") {
    return "yellow";
  } else if (group === "GOOGLE") {
    return "green";
  }
};

export const participantUsername = (participant) => {
  if (participant?.group === "GOOGLE") {
    return `${participant?.info?.gelar_depan} ${participant?.info?.username} ${participant?.info?.gelar_belakang}`;
  } else {
    return participant?.username;
  }
};

export const participantEmployeeNumber = (participant) => {
  if (participant?.group === "GOOGLE") {
    return participant?.info?.employee_number;
  } else {
    return participant?.employee_number;
  }
};

// show information for webinar series
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

export const findPangkat = (idPangkat) => {
  return REF_PANGKAT.find((item) => item.id === idPangkat)?.nama_pangkat;
};

export const findGolongan = (idPangkat) => {
  return REF_PANGKAT.find((item) => item.id === idPangkat)?.nama;
};

export const setColorStatusCoachingClinic = (status) => {
  if (status === "upcoming") {
    return "yellow";
  } else if (status === "live") {
    return "green";
  } else if (status === "end") {
    return "red";
  }
};

export const setColorStatusUsulan = (status) => {
  // 22 sudah di ttd pertek
  // 32 pembuatan sk berhasil
  if (status === "22") {
    return "yellow";
  } else if (status === "32") {
    return "green";
  } else {
    return "red";
  }
};

export const socmedActivities = (activity) => {
  // parsing object to text : {user} {action} {post}
  const { type, user, trigger_user } = activity;
  let action;
  let text;
  if (type === "post") {
    action = `${user?.username} membuat postingan baru`;
    text = "membuat postingan baru";
  } else if (type === "like") {
    action = `${user?.username} menyukai postingan ${trigger_user?.username}`;
    text = "menyukai postingan";
  } else if (type === "comment") {
    text = "berkomentar pada postingan";
    action = `${user?.username} berkomentar pada postingan ${trigger_user?.username}`;
  }

  return {
    text,
    action,
    user: user,
    trigger_user: trigger_user,
  };
};

export const getJenisJabatanId = (jenisJabatan) => {
  if (jenisJabatan === "Fungsional") {
    return "2";
  } else if (jenisJabatan === "Struktural") {
    return "1";
  } else if (jenisJabatan === "Pelaksana") {
    return "4";
  }
};

export const getNamaJabatan = (idJabatan) => {
  if (idJabatan === "1") {
    return "Struktural";
  } else if (idJabatan === "2") {
    return "Fungsional";
  } else if (idJabatan === "4") {
    return "Pelaksana";
  }
};

export const checkKonversiIntegrasiPertama = (data) => {
  if (data?.isAngkaKreditPertama === "1") {
    return "Angka Kredit Pertama";
  } else if (data?.isKonversi === "1") {
    return "Konversi";
  } else if (data?.isIntegrasi === "1") {
    return "Integrasi";
  }
};

export const dataKategoriIPASN = (total) => {
  // 91.00 - 100.00 sangat tingg
  // 81.00 - 90.99 tinggi
  // 71.00 - 80.99 cukup
  // 61.00 - 70.99 rendah
  // <= 60.99 sangat rendah

  const totalInt = Math.floor(total * 100) / 100;

  if (totalInt >= 91.0 && totalInt <= 100.0) {
    return "Sangat Tinggi";
  }
  if (totalInt >= 81.0 && totalInt <= 90.99) {
    return "Tinggi";
  }
  if (totalInt >= 71.0 && totalInt <= 80.99) {
    return "Cukup";
  }
  if (totalInt >= 61.0 && totalInt <= 70.99) {
    return "Rendah";
  }
  if (totalInt <= 60.99) {
    return "Sangat Rendah";
  }
};

export const serializeFormatTest = (inputData) => {
  const question = inputData.question;
  const correctAnswer = inputData.correctAnswer;
  const answers = [];

  // Loop through each property in the inputData object
  Object.keys(inputData).forEach((key) => {
    if (key.startsWith("answer")) {
      // Extract the ID from the key by splitting it at the '-' and taking the second part
      const id = key.split("-")[1];
      // Check if this answer is the correct one
      const isCorrect =
        parseInt(key.split("answer")[1].split("-")[0], 10) === correctAnswer;
      // Push the answer object to the answers array
      answers.push({ id, text: inputData[key], isCorrect });
    }
  });

  // Return the transformed data
  return {
    question,
    answers,
  };
};

export const serializeFormatTestNormal = (transformedData) => {
  const result = {
    question: transformedData.question,
    correctAnswer: transformedData.answers.find((answer) => answer.isCorrect)
      .id,
  };

  // Loop through each answer in the answers array
  transformedData.answers.forEach((answer, index) => {
    // Construct the answer key using the index and the answer ID
    const key = `answer${index + 1}-${answer.id}`;
    // Add the answer text to the result object with the constructed key
    result[key] = answer.text;
  });

  return result;
};

export const daftarStruktural = [
  {
    id: "10",
    nama: "I.a",
    terendah_id: "44",
    tertinggi_id: "45",
    eselon_level_id: "0",
    asn_jenjang_jabatan_id: "01",
    jabatan_asn: "JABATAN PIMPINAN TINGGI UTAMA",
    level_kompetensi_jabatan: "",
  },
  {
    id: "11",
    nama: "I.a",
    terendah_id: "43",
    tertinggi_id: "45",
    eselon_level_id: "1",
    asn_jenjang_jabatan_id: "02",
    jabatan_asn: "JABATAN PIMPINAN TINGGI MADYA",
    level_kompetensi_jabatan: "",
  },
  {
    id: "12",
    nama: "I.b",
    terendah_id: "42",
    tertinggi_id: "45",
    eselon_level_id: "1",
    asn_jenjang_jabatan_id: "02",
    jabatan_asn: "JABATAN PIMPINAN TINGGI MADYA",
    level_kompetensi_jabatan: "",
  },
  {
    id: "21",
    nama: "II.a",
    terendah_id: "42",
    tertinggi_id: "44",
    eselon_level_id: "2",
    asn_jenjang_jabatan_id: "03",
    jabatan_asn: "JABATAN PIMPINAN TINGGI PRATAMA",
    level_kompetensi_jabatan: "",
  },
  {
    id: "22",
    nama: "II.b",
    terendah_id: "41",
    tertinggi_id: "43",
    eselon_level_id: "2",
    asn_jenjang_jabatan_id: "03",
    jabatan_asn: "JABATAN PIMPINAN TINGGI PRATAMA",
    level_kompetensi_jabatan: "",
  },
  {
    id: "31",
    nama: "III.a",
    terendah_id: "34",
    tertinggi_id: "42",
    eselon_level_id: "3",
    asn_jenjang_jabatan_id: "04",
    jabatan_asn: "JABATAN ADMINISTRATOR",
    level_kompetensi_jabatan: "",
  },
  {
    id: "32",
    nama: "III.b",
    terendah_id: "33",
    tertinggi_id: "41",
    eselon_level_id: "3",
    asn_jenjang_jabatan_id: "04",
    jabatan_asn: "JABATAN ADMINISTRATOR",
    level_kompetensi_jabatan: "",
  },
  {
    id: "41",
    nama: "IV.a",
    terendah_id: "32",
    tertinggi_id: "34",
    eselon_level_id: "4",
    asn_jenjang_jabatan_id: "05",
    jabatan_asn: "JABATAN PENGAWAS",
    level_kompetensi_jabatan: "",
  },
  {
    id: "42",
    nama: "IV.b",
    terendah_id: "31",
    tertinggi_id: "33",
    eselon_level_id: "4",
    asn_jenjang_jabatan_id: "05",
    jabatan_asn: "JABATAN PENGAWAS",
    level_kompetensi_jabatan: "",
  },
];

export const dokumenMaster = [
  {
    id: "pangkat",
    name: "pangkat",
  },
  {
    id: "pendidiikan",
    name: "pendidikan",
  },
];

export const additionalData = [
  {
    id: "surat-pengantar",
    name: "Surat Pengantar",
  },
];

export const NOTIFICATION_ATTR = {
  color: "#595959",
  size: 16,
};

export const setJenisJabatanColor = (jenisJabatan) => {
  if (jenisJabatan === "Struktural") {
    return "red";
  } else if (jenisJabatan === "Fungsional") {
    return "gray";
  } else if (jenisJabatan === "Pelaksana") {
    return "yellow";
  }
};

// jabatan guru, ahli pertama, ahli muda, ahli madya, ahli utama
// jabatan fungsional tertentu, terampil, mahir, ahli pertama, ahli muda, ahli madya, ahli utama

const daftarJabatanGuru = [
  "guru ahli pertama",
  "guru ahli muda",
  "guru ahli madya",
  "guru ahli utama",
];

const daftarJabatanFungsionalTertentu = [
  { title: "terampil", value: "terampil" },
  { title: "mahir", value: "mahir" },
  { title: "ahli pertama", value: "pertama" },
  { title: "ahli muda", value: "muda" },
  { title: "ahli madya", value: "madya" },
  { title: "ahli utama", value: "utama" },
];

export const cekJabatanGuruSalah = (jabatan) => {
  // trim dulu
  const jabatanTrim = jabatan?.trim()?.toLowerCase();
  return daftarJabatanGuru.includes(jabatanTrim);
};

export const cekJabatanFungsional = (jabatan) => {
  // trim dulu jabatan dan lowercase kemudian cek jika di paramater jabatan apa ada kata di jabatan yang mirip dengan daftarJabatanFungsionalTertentu, jika ada return value nya
  const jabatanTrim = jabatan?.trim()?.toLowerCase();
  const jabatanCek = daftarJabatanFungsionalTertentu.find(
    (item) => item.title === jabatanTrim
  );
  const kata = `JFT ${jabatanCek?.value}`;
  return kata;
};

export const getUmur = (tanggalLahir) => {
  // format tanggal lahir DD-MM-YYYY
  // gunakan dayjs
  const today = dayjs();
  const birth = dayjs(tanggalLahir, "DD-MM-YYYY");
  const umur = today.diff(birth, "year");
  return umur;
};

export const formatCurrency = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // To avoid showing any decimal places
  })
    .format(number)
    .replace(/(\.|,)00$/g, "");
};

export const personLikes = (likes, currentUserId) => {
  const usernames = likes.map((like) => {
    if (like?.user?.custom_id === currentUserId) {
      return "Anda";
    } else {
      return like?.user?.username;
    }
  });

  let result = "";
  if (usernames?.length === 1) {
    result = usernames[0];
  } else if (usernames?.length === 2) {
    result = usernames.join(" dan ");
  } else if (usernames?.length > 2) {
    const last = usernames?.pop();
    result = usernames?.join(", ") + ", dan " + last;
  }

  return result + " menyukai postingan ini";
};

export const mineLike = (currentUserId, likes) => {
  return likes.some((like) => like?.user?.custom_id === currentUserId);
};

export const artiStatus = (status) => {
  if (status === "Input Berkas") {
    return "Masih di Instansi menu input usulan";
  } else if (status === "Berkas Terverifikasi") {
    return "Sudah selesai diverifikasi instansi";
  } else if (status === "Tidak Memenuhi Syarat") {
    return "Di TMS oleh Approval instansi/BKN";
  } else if (status === "Terima Usulan") {
    return "Sudah di approve instansi, saat ini di inbox Tim Teknis BKN Berkas";
  } else if (status === "Disetujui") {
    return "Sudah divalidasi Tim Teknis BKN, sekarang di inbox Pemaraf Setuju Paraf SK";
  } else if (status === "Sudah di Paraf") {
    return "Sekarang di inbox Penandatanganan";
  } else if (status === "Profil PNS telah diperbaharui") {
    return "Sudah di TTD BKN, Surat PG siap di Inbox SK dan riwayat pendidikan ybs sudah ter update";
  } else if (status === "Validasi Usulan - Tidak Memenuhi Syarat") {
    return "Sudah pernah di approve lalu masuk inbox BKN";
  } else if (status === "Perbaikan Dokumen") {
    return "Masih di Instansi menu perbaikan dokumen";
  } else return "";
};

export const refPeriodik = [
  { value: 1, title: "Bulanan" },
  { value: 2, title: "Triwulanan" },
];

export const refHasilKerja = [
  { value: 1, title: "Diatas Ekspektasi" },
  { value: 2, title: "Sesuai Ekspektasi" },
  { value: 3, title: "Dibawah Ekspektasi" },
];

export const refKoefisien = [
  {
    value: 12,
    title: "Ahli Pertama",
    kriteria: 12.5,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "PT",
  },
  {
    value: 22,
    title: "Ahli Muda",
    kriteria: 25.0,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "MU",
  },
  {
    value: 32,
    title: "Ahli Madya",
    kriteria: 37.5,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "MA",
  },
  {
    value: 42,
    title: "Ahli Utama",
    kriteria: 50.0,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "UT",
  },
  {
    value: 52,
    title: "Pemula",
    kriteria: 3.75,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "PM",
  },
  {
    value: 62,
    title: "Terampil",
    kriteria: 5.0,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "TR",
  },
  {
    value: 72,
    title: "Mahir",
    kriteria: 12.5,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "MH",
  },
  {
    value: 82,
    title: "Penyelia",
    kriteria: 25.0,
    persentase: 100,
    keterangan: "Baik",
    jenjang: "PY",
  },
];

export const getKuadran = (a, b) => {
  if (a === b) {
    if (a === 1) {
      return 1;
    } else if (a === 2) {
      return 2;
    } else if (a === 3) {
      return 5;
    }
  } else {
    return Math.max(a, b);
  }
};

export const serializeCommentText = (item) => {
  const text = `${item?.user?.username} telah berkomentar pada postingan anda`;
  return text;
};

export const fetchPdf = async (url) => {
  const response = await axios.get(url, {
    responseType: "blob",
  });
  const file = new File([response.data], "file.pdf", {
    type: response.data.type,
  });
  return file;
};

export const clearQuery = (query) => {
  return queryString.stringify(query, {
    skipNull: true,
    skipEmptyString: true,
  });
};
