import { Badge } from "@mantine/core";
import {
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconRefresh,
  IconEdit,
  IconFileText,
  IconCertificate,
} from "@tabler/icons-react";

export const DocumentStatusBadge = ({ status }) => {
  const statusConfig = {
    draft: {
      color: "gray",
      text: "Draft",
      icon: <IconEdit size={14} />
    },
    in_progress: {
      color: "blue",
      text: "Dalam Proses",
      icon: <IconRefresh size={14} />
    },
    signed: {
      color: "green",
      text: "Ditandatangani",
      icon: <IconCertificate size={14} />
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge
      color={config.color}
      variant="light"
      leftSection={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </div>
      }
      size="sm"
      styles={{
        section: {
          display: 'flex',
          alignItems: 'center',
        }
      }}
    >
      {config.text}
    </Badge>
  );
};

export const SignatureRequestStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "yellow",
      text: "Menunggu",
      icon: <IconClock size={14} />
    },
    in_progress: {
      color: "blue",
      text: "Proses",
      icon: <IconRefresh size={14} />
    },
    completed: {
      color: "green",
      text: "Selesai",
      icon: <IconCheck size={14} />
    },
    cancelled: {
      color: "gray",
      text: "Dibatalkan",
      icon: <IconX size={14} />
    },
    rejected: {
      color: "red",
      text: "Ditolak",
      icon: <IconX size={14} />
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      color={config.color}
      variant="light"
      leftSection={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </div>
      }
      size="sm"
      styles={{
        section: {
          display: 'flex',
          alignItems: 'center',
        }
      }}
    >
      {config.text}
    </Badge>
  );
};

export const BsreStatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      color: "yellow",
      text: "Menunggu",
      icon: <IconRefresh size={14} />
    },
    processing: {
      color: "blue",
      text: "Proses",
      icon: <IconRefresh size={14} />
    },
    completed: {
      color: "green",
      text: "Berhasil",
      icon: <IconCheck size={14} />
    },
    failed: {
      color: "red",
      text: "Gagal",
      icon: <IconX size={14} />
    },
    timeout: {
      color: "orange",
      text: "Timeout",
      icon: <IconAlertCircle size={14} />
    },
    cancelled: {
      color: "gray",
      text: "Dibatalkan",
      icon: <IconX size={14} />
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      color={config.color}
      variant="light"
      leftSection={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </div>
      }
      size="sm"
      styles={{
        section: {
          display: 'flex',
          alignItems: 'center',
        }
      }}
    >
      {config.text}
    </Badge>
  );
};

export const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    low: {
      color: "gray",
      text: "Rendah",
      icon: <IconAlertCircle size={12} />
    },
    normal: {
      color: "blue",
      text: "Normal",
      icon: <IconAlertCircle size={12} />
    },
    high: {
      color: "orange",
      text: "Tinggi",
      icon: <IconAlertCircle size={12} />
    },
    urgent: {
      color: "red",
      text: "Mendesak",
      icon: <IconAlertCircle size={12} />
    },
  };

  const config = priorityConfig[priority] || priorityConfig.normal;

  return (
    <Badge
      color={config.color}
      variant="filled"
      leftSection={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {config.icon}
        </div>
      }
      size="xs"
      styles={{
        section: {
          display: 'flex',
          alignItems: 'center',
        }
      }}
    >
      {config.text}
    </Badge>
  );
};