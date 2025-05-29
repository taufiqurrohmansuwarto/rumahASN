// utils/emailFolderConfig.js

import {
  InboxOutlined,
  SendOutlined,
  FileOutlined,
  StarOutlined,
  FolderOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  FlagOutlined,
  TagOutlined,
  BellOutlined,
} from "@ant-design/icons";

import {
  getInboxEmails,
  getSentEmails,
  getDraftsEmails,
  getStarredEmails,
  getArchiveEmails,
  getSpamEmails,
  getTrashEmails,
  getImportantEmails,
  getLabelEmails,
} from "@/services/rasn-mail.services";

export const getFolderConfig = (folder) => {
  const configs = {
    inbox: {
      title: "Inbox",
      subtitle: "Kotak Masuk",
      icon: <InboxOutlined />,
      primaryColor: "#1890ff",
      badgeColor: "#EA4335",
      apiFunction: getInboxEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: [
        "star",
        "read",
        "archive",
        "spam",
        "delete",
        "reply",
        "forward",
      ],
      bulkActions: ["delete", "archive", "spam"],
      emptyTitle: "Inbox Anda kosong",
      emptyDescription: "Mulai berkirim email dengan kolega Anda",
      emptyAction: {
        label: "Tulis Email Pertama",
        action: "compose",
      },
    },

    sent: {
      title: "Sent",
      subtitle: "Terkirim",
      icon: <SendOutlined />,
      primaryColor: "#52c41a",
      badgeColor: "#52c41a",
      apiFunction: getSentEmails,
      showUnreadBadge: false,
      showRecipient: true,
      allowMarkAsRead: false,
      clickAction: "view",
      availableFilters: ["search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "delete", "forward"],
      bulkActions: ["delete"],
      emptyTitle: "Belum ada email terkirim",
      emptyDescription: "Email yang Anda kirim akan muncul di sini",
      emptyAction: {
        label: "Tulis Email Baru",
        action: "compose",
      },
    },

    drafts: {
      title: "Drafts",
      subtitle: "Draf",
      icon: <FileOutlined />,
      primaryColor: "#722ed1",
      badgeColor: "#722ed1",
      apiFunction: getDraftsEmails,
      showUnreadBadge: false,
      showRecipient: true,
      allowMarkAsRead: false,
      clickAction: "edit",
      showDraftBadge: true,
      availableFilters: ["search"], // ✅ TAMBAHKAN INI
      itemActions: ["edit", "send", "delete"],
      bulkActions: ["delete"],
      emptyTitle: "Belum ada draft",
      emptyDescription: "Draft email Anda akan tersimpan di sini",
      emptyAction: {
        label: "Tulis Email Baru",
        action: "compose",
      },
    },

    starred: {
      title: "Starred",
      subtitle: "Berbintang",
      icon: <StarOutlined />,
      primaryColor: "#faad14",
      badgeColor: "#faad14",
      apiFunction: getStarredEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "read", "archive", "delete", "reply", "forward"],
      bulkActions: ["delete", "archive"],
      emptyTitle: "Belum ada email berbintang",
      emptyDescription:
        "Email yang Anda tandai dengan bintang akan muncul di sini",
      emptyAction: null,
    },

    archive: {
      title: "Archive",
      subtitle: "Arsip",
      icon: <FolderOutlined />,
      primaryColor: "#13c2c2",
      badgeColor: "#13c2c2",
      apiFunction: getArchiveEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "read", "inbox", "delete", "reply", "forward"],
      bulkActions: ["delete", "inbox"],
      emptyTitle: "Belum ada email diarsipkan",
      emptyDescription: "Email yang Anda arsipkan akan muncul di sini",
      emptyAction: null,
    },

    spam: {
      title: "Spam",
      subtitle: "Spam",
      icon: <ExclamationCircleOutlined />,
      primaryColor: "#fa8c16",
      badgeColor: "#fa8c16",
      apiFunction: getSpamEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "read", "not-spam", "delete"],
      bulkActions: ["delete", "not-spam"],
      emptyTitle: "Belum ada email spam",
      emptyDescription: "Email yang ditandai spam akan muncul di sini",
      emptyAction: null,
    },

    trash: {
      title: "Trash",
      subtitle: "Sampah",
      icon: <DeleteOutlined />,
      primaryColor: "#ff4d4f",
      badgeColor: "#ff4d4f",
      apiFunction: getTrashEmails,
      showUnreadBadge: false,
      showRecipient: false,
      allowMarkAsRead: false,
      clickAction: "view",
      availableFilters: ["search"], // ✅ TAMBAHKAN INI
      itemActions: ["restore", "delete-permanent"],
      bulkActions: ["restore", "delete-permanent"],
      emptyTitle: "Sampah kosong",
      emptyDescription: "Email yang dihapus akan muncul di sini selama 30 hari",
      emptyAction: null,
    },

    important: {
      title: "Important",
      subtitle: "Penting",
      icon: <FlagOutlined />,
      primaryColor: "#ff4d4f",
      badgeColor: "#ff4d4f",
      apiFunction: getImportantEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "read", "archive", "delete", "reply", "forward"],
      bulkActions: ["delete", "archive"],
      emptyTitle: "Belum ada email penting",
      emptyDescription: "Email dengan prioritas tinggi akan muncul di sini",
      emptyAction: null,
    },

    label: {
      title: "Label",
      subtitle: "Label",
      icon: <TagOutlined />,
      primaryColor: "#722ed1",
      badgeColor: "#722ed1",
      apiFunction: getLabelEmails,
      showUnreadBadge: true,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["unread", "search"], // ✅ TAMBAHKAN INI
      itemActions: ["star", "read", "archive", "delete", "reply", "forward"],
      bulkActions: ["delete", "archive"],
      emptyTitle: "Belum ada email dengan label ini",
      emptyDescription: "Email yang diberi label akan muncul di sini",
      emptyAction: null,
    },

    snoozed: {
      title: "Snoozed",
      subtitle: "Ditunda",
      icon: <BellOutlined />,
      primaryColor: "#faad14",
      badgeColor: "#faad14",
      apiFunction: null, // Not implemented yet
      showUnreadBadge: false,
      showRecipient: false,
      allowMarkAsRead: true,
      clickAction: "view",
      availableFilters: ["search"], // ✅ TAMBAHKAN INI
      itemActions: ["unsnooze", "delete"],
      bulkActions: ["unsnooze", "delete"],
      emptyTitle: "Belum ada email ditunda",
      emptyDescription: "Email yang di-snooze akan muncul di sini",
      emptyAction: null,
    },
  };

  return configs[folder] || configs.inbox;
};

// ✅ TAMBAHKAN ACTION CONFIG
export const getActionConfig = (action) => {
  const actions = {
    star: {
      label: "Star",
      icon: "StarOutlined",
      danger: false,
    },
    read: {
      label: "Mark as Read",
      icon: "EyeOutlined",
      danger: false,
    },
    archive: {
      label: "Archive",
      icon: "FolderOutlined",
      danger: false,
    },
    spam: {
      label: "Mark as Spam",
      icon: "ExclamationCircleOutlined",
      danger: false,
    },
    "not-spam": {
      label: "Not Spam",
      icon: "CheckOutlined",
      danger: false,
    },
    inbox: {
      label: "Move to Inbox",
      icon: "InboxOutlined",
      danger: false,
    },
    delete: {
      label: "Delete",
      icon: "DeleteOutlined",
      danger: true,
    },
    reply: {
      label: "Reply",
      icon: "SendOutlined",
      danger: false,
    },
    forward: {
      label: "Forward",
      icon: "ForwardOutlined",
      danger: false,
    },
    edit: {
      label: "Edit",
      icon: "EditOutlined",
      danger: false,
    },
    restore: {
      label: "Restore",
      icon: "UndoOutlined",
      danger: false,
    },
    "delete-permanent": {
      label: "Delete Forever",
      icon: "DeleteOutlined",
      danger: true,
    },
    unsnooze: {
      label: "Unsnooze",
      icon: "BellOutlined",
      danger: false,
    },
  };

  return actions[action];
};
