// utils/emailFolderConfig.js
import {
  InboxOutlined,
  SendOutlined,
  FileOutlined,
  DeleteOutlined,
  FolderOutlined,
  BellOutlined,
  StarOutlined,
} from "@ant-design/icons";
import {
  getInboxEmails,
  getSentEmails,
  getDraftsEmails,
  getTrashEmails,
  getArchiveEmails,
  getSpamEmails,
  getSnoozedEmails,
  getStarredEmails,
  getImportantEmails,
} from "@/services/rasn-mail.services";

export const FOLDER_CONFIGS = {
  inbox: {
    key: "inbox",
    title: "Inbox",
    subtitle: "Kotak Masuk",
    icon: <InboxOutlined />,
    apiFunction: getInboxEmails,

    // List behavior
    showSender: true,
    showRecipient: false,
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showDraftBadge: false,
    clickAction: "view", // view | edit

    // Actions available in list
    itemActions: ["star", "read", "archive", "delete", "reply", "forward"],
    bulkActions: ["read", "archive", "delete"],

    // Filters available
    availableFilters: ["unread", "starred", "important"],
    defaultFilter: {},

    // Empty state
    emptyTitle: "Inbox Anda kosong",
    emptyDescription: "Mulai berkirim email dengan kolega Anda",
    emptyAction: {
      label: "Tulis Email Pertama",
      action: "compose",
    },

    // Colors and styling
    primaryColor: "#1890ff",
    badgeColor: "#EA4335",
  },

  sent: {
    key: "sent",
    title: "Sent",
    subtitle: "Terkirim",
    icon: <SendOutlined />,
    apiFunction: getSentEmails,

    showSender: false,
    showRecipient: true,
    allowMarkAsRead: false,
    showUnreadBadge: false,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["star", "archive", "delete", "forward"],
    bulkActions: ["archive", "delete"],

    availableFilters: ["starred", "important"],
    defaultFilter: {},

    emptyTitle: "Belum ada email terkirim",
    emptyDescription: "Email yang Anda kirim akan muncul di sini",
    emptyAction: {
      label: "Tulis Email Baru",
      action: "compose",
    },

    primaryColor: "#52c41a",
    badgeColor: "#52c41a",
  },

  drafts: {
    key: "drafts",
    title: "Drafts",
    subtitle: "Draft",
    icon: <FileOutlined />,
    apiFunction: getDraftsEmails,

    showSender: false,
    showRecipient: true,
    allowMarkAsRead: false,
    showUnreadBadge: false,
    showDraftBadge: true,
    clickAction: "edit",

    itemActions: ["edit", "send", "delete"],
    bulkActions: ["delete", "send"],

    availableFilters: [],
    defaultFilter: {},

    emptyTitle: "Tidak ada draft",
    emptyDescription: "Draft email yang belum dikirim akan muncul di sini",
    emptyAction: {
      label: "Tulis Email Baru",
      action: "compose",
    },

    primaryColor: "#722ed1",
    badgeColor: "#722ed1",
  },

  trash: {
    key: "trash",
    title: "Trash",
    subtitle: "Sampah",
    icon: <DeleteOutlined />,
    apiFunction: getTrashEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: false,
    showUnreadBadge: false,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["restore", "delete-permanent"],
    bulkActions: ["restore", "delete-permanent", "empty-trash"],

    availableFilters: [],
    defaultFilter: {},

    emptyTitle: "Trash kosong",
    emptyDescription: "Email yang dihapus akan muncul di sini selama 30 hari",
    emptyAction: null,

    primaryColor: "#ff4d4f",
    badgeColor: "#ff4d4f",
  },

  archive: {
    key: "archive",
    title: "Archive",
    subtitle: "Arsip",
    icon: <FolderOutlined />,
    apiFunction: getArchiveEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["star", "inbox", "delete"],
    bulkActions: ["inbox", "delete"],

    availableFilters: ["unread", "starred"],
    defaultFilter: {},

    emptyTitle: "Tidak ada email terarsip",
    emptyDescription: "Email yang diarsipkan akan muncul di sini",
    emptyAction: null,

    primaryColor: "#fa8c16",
    badgeColor: "#fa8c16",
  },

  spam: {
    key: "spam",
    title: "Spam",
    subtitle: "Spam",
    icon: <BellOutlined />,
    apiFunction: getSpamEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: false,
    showUnreadBadge: false,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["not-spam", "delete-permanent"],
    bulkActions: ["not-spam", "delete-permanent"],

    availableFilters: [],
    defaultFilter: {},

    emptyTitle: "Tidak ada spam",
    emptyDescription: "Email spam akan muncul di sini",
    emptyAction: null,

    primaryColor: "#faad14",
    badgeColor: "#faad14",
  },

  snoozed: {
    key: "snoozed",
    title: "Snoozed",
    subtitle: "Ditunda",
    icon: <StarOutlined />,
    apiFunction: getSnoozedEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["unsnooze", "star", "delete"],
    bulkActions: ["unsnooze", "delete"],

    availableFilters: ["unread", "starred"],
    defaultFilter: {},

    emptyTitle: "Tidak ada email ditunda",
    emptyDescription: "Email yang dijadwalkan akan muncul di sini",
    emptyAction: null,

    primaryColor: "#13c2c2",
    badgeColor: "#13c2c2",
  },

  starred: {
    key: "starred",
    title: "Starred",
    subtitle: "Berbintang",
    icon: <StarOutlined />,
    apiFunction: getStarredEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["unstar", "archive", "delete"],
    bulkActions: ["unstar", "archive", "delete"],

    availableFilters: ["unread"],
    defaultFilter: {},

    emptyTitle: "Tidak ada email berbintang",
    emptyDescription: "Email yang diberi bintang akan muncul di sini",
    emptyAction: null,

    primaryColor: "#faad14",
    badgeColor: "#faad14",
  },

  important: {
    key: "important",
    title: "Important",
    subtitle: "Penting",
    icon: <BellOutlined style={{ color: "#ff4d4f" }} />,
    apiFunction: getImportantEmails,

    showSender: true,
    showRecipient: false,
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showDraftBadge: false,
    clickAction: "view",

    itemActions: ["star", "archive", "delete"],
    bulkActions: ["archive", "delete"],

    availableFilters: ["unread", "starred"],
    defaultFilter: {},

    emptyTitle: "Tidak ada email penting",
    emptyDescription: "Email yang ditandai penting akan muncul di sini",
    emptyAction: null,

    primaryColor: "#ff4d4f",
    badgeColor: "#ff4d4f",
  },
};

// Helper functions
export const getFolderConfig = (folderKey) => {
  return FOLDER_CONFIGS[folderKey] || FOLDER_CONFIGS.inbox;
};

export const getFolderTitle = (folderKey) => {
  return getFolderConfig(folderKey).subtitle;
};

export const getFolderIcon = (folderKey) => {
  return getFolderConfig(folderKey).icon;
};

export const getFolderColor = (folderKey) => {
  return getFolderConfig(folderKey).primaryColor;
};

// Action configurations
export const ACTION_CONFIGS = {
  star: {
    key: "star",
    label: "Tandai Bintang",
    icon: "StarOutlined",
    type: "toggle",
  },
  read: {
    key: "read",
    label: "Tandai Dibaca",
    icon: "EyeOutlined",
    type: "toggle",
  },
  archive: {
    key: "archive",
    label: "Arsipkan",
    icon: "FolderOutlined",
    type: "action",
  },
  delete: {
    key: "delete",
    label: "Hapus",
    icon: "DeleteOutlined",
    type: "action",
    danger: true,
  },
  reply: {
    key: "reply",
    label: "Balas",
    icon: "SendOutlined",
    type: "action",
  },
  forward: {
    key: "forward",
    label: "Teruskan",
    icon: "ForwardOutlined",
    type: "action",
  },
  edit: {
    key: "edit",
    label: "Edit",
    icon: "EditOutlined",
    type: "action",
  },
  send: {
    key: "send",
    label: "Kirim",
    icon: "SendOutlined",
    type: "action",
    primary: true,
  },
  restore: {
    key: "restore",
    label: "Pulihkan",
    icon: "UndoOutlined",
    type: "action",
  },
  "delete-permanent": {
    key: "delete-permanent",
    label: "Hapus Permanen",
    icon: "DeleteOutlined",
    type: "action",
    danger: true,
  },
  "not-spam": {
    key: "not-spam",
    label: "Bukan Spam",
    icon: "CheckOutlined",
    type: "action",
  },
  unsnooze: {
    key: "unsnooze",
    label: "Batalkan Tunda",
    icon: "UndoOutlined",
    type: "action",
  },
  inbox: {
    key: "inbox",
    label: "Pindah ke Inbox",
    icon: "InboxOutlined",
    type: "action",
  },
  unstar: {
    key: "unstar",
    label: "Hapus Bintang",
    icon: "StarOutlined",
    type: "action",
  },
  "empty-trash": {
    key: "empty-trash",
    label: "Kosongkan Trash",
    icon: "DeleteOutlined",
    type: "bulk-only",
    danger: true,
  },
};

export const getActionConfig = (actionKey) => {
  return ACTION_CONFIGS[actionKey];
};

export default FOLDER_CONFIGS;
