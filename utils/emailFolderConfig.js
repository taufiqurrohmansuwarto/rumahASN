// utils/emailFolderConfig.js
import {
  InboxOutlined,
  SendOutlined,
  FileOutlined,
  StarOutlined,
  FolderOutlined,
  DeleteOutlined,
  BellOutlined,
  TagOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  getInboxEmails,
  getSentEmails,
  getDraftsEmails,
  getStarredEmails,
  getArchiveEmails,
  getSpamEmails,
  getTrashEmails,
  getLabelEmails,
  getImportantEmails,
} from "@/services/rasn-mail.services";

export const getFolderConfig = (folder) => {
  const baseConfig = {
    primaryColor: "#1890ff",
    allowMarkAsRead: true,
    showUnreadBadge: true,
    showRecipient: false,
    showDraftBadge: false,
    availableFilters: ["search", "unread"],
    itemActions: ["star", "read", "move", "delete"],
    bulkActions: {},
    badgeColor: "#52c41a",
  };

  const configs = {
    inbox: {
      ...baseConfig,
      title: "Inbox",
      subtitle: "Kotak Masuk",
      icon: <InboxOutlined />,
      primaryColor: "#1890ff",
      apiFunction: getInboxEmails,
      emptyTitle: "Kotak masuk Anda kosong",
      emptyDescription: "Email baru akan muncul di sini",
      emptyAction: {
        label: "Tulis Email Pertama",
        action: "compose",
      },
      clickAction: "view",
      bulkActions: {
        primary: ["archive", "spam", "delete"],
        secondary: ["mark-unread", "move-to-folder"],
        more: ["label"],
      },
    },

    starred: {
      ...baseConfig,
      title: "Starred",
      subtitle: "Pesan Ditandai",
      showRecipient: true,
      icon: <StarOutlined />,
      primaryColor: "#faad14",
      apiFunction: getStarredEmails,
      emptyTitle: "Belum ada email yang ditandai",
      emptyDescription: "Email yang Anda beri bintang akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["archive", "spam", "delete"],
        secondary: ["mark-read", "move-inbox"],
        more: ["label"],
      },
    },

    sent: {
      ...baseConfig,
      title: "Sent",
      subtitle: "Pesan Terkirim",
      icon: <SendOutlined />,
      primaryColor: "#52c41a",
      apiFunction: getSentEmails,
      showRecipient: true,
      allowMarkAsRead: false,
      availableFilters: ["search"],
      emptyTitle: "Belum ada email terkirim",
      emptyDescription: "Email yang Anda kirim akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["archive", "spam", "delete"],
        secondary: ["mark-unread", "move-inbox"],
        more: ["label"],
      },
    },

    drafts: {
      ...baseConfig,
      title: "Drafts",
      subtitle: "Draf Pesan",
      icon: <FileOutlined />,
      primaryColor: "#722ed1",
      apiFunction: getDraftsEmails,
      showDraftBadge: true,
      allowMarkAsRead: false,
      availableFilters: ["search"],
      emptyTitle: "Belum ada draf",
      emptyDescription: "Draf email Anda akan tersimpan di sini",
      emptyAction: {
        label: "Tulis Email Baru",
        action: "compose",
      },
      clickAction: "edit",
      itemActions: ["edit", "delete"],
      bulkActions: {
        primary: ["discard"],
      },
    },

    trash: {
      ...baseConfig,
      title: "Trash",
      subtitle: "Sampah",
      icon: <DeleteOutlined />,
      primaryColor: "#ff4d4f",
      apiFunction: getTrashEmails,
      allowMarkAsRead: false,
      availableFilters: ["search"],
      emptyTitle: "Sampah kosong",
      emptyDescription: "Email yang dihapus akan muncul di sini",
      clickAction: "view",
      itemActions: ["restore", "delete-permanent"],
      bulkActions: {
        primary: ["delete-permanent", "spam"],
        secondary: ["mark-unread", "move-to-folder"],
        more: ["label"],
      },
    },

    archive: {
      ...baseConfig,
      title: "Archive",
      subtitle: "Arsip Pesan",
      icon: <FolderOutlined />,
      primaryColor: "#13c2c2",
      apiFunction: getArchiveEmails,
      emptyTitle: "Arsip kosong",
      emptyDescription: "Email yang diarsipkan akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["restore-inbox", "spam", "delete"],
        secondary: ["mark-read", "mark-unread"],
        more: ["label"],
      },
    },

    spam: {
      ...baseConfig,
      title: "Spam",
      subtitle: "Pesan Spam",
      icon: <BellOutlined />,
      primaryColor: "#fa8c16",
      apiFunction: getSpamEmails,
      emptyTitle: "Tidak ada spam",
      emptyDescription: "Email spam akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["not-spam", "delete"],
        secondary: ["mark-read", "mark-unread"],
        more: ["label"],
      },
    },

    important: {
      ...baseConfig,
      title: "Important",
      subtitle: "Pesan Penting",
      icon: <TagOutlined />,
      primaryColor: "#ff4d4f",
      apiFunction: getImportantEmails,
      emptyTitle: "Belum ada email penting",
      emptyDescription: "Email prioritas tinggi akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["archive", "spam", "delete"],
        secondary: ["mark-read", "mark-unread"],
        more: ["label"],
      },
    },

    label: {
      ...baseConfig,
      title: "Label",
      subtitle: "Label",
      icon: <TagOutlined />,
      primaryColor: "#722ed1",
      apiFunction: getLabelEmails,
      emptyTitle: "Belum ada email dengan label ini",
      emptyDescription: "Email yang diberi label akan muncul di sini",
      clickAction: "view",
      bulkActions: {
        primary: ["archive", "spam", "delete"],
        secondary: ["mark-read", "mark-unread"],
        more: ["remove-label", "add-label"],
      },
    },
  };

  return configs[folder] || configs.inbox;
};
