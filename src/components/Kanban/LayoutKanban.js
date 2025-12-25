import { Tabs, Space } from "antd";
import { useRouter } from "next/router";
import {
  IconLayoutKanban,
  IconSettings,
  IconChartBar,
  IconUserCheck,
} from "@tabler/icons-react";

function LayoutKanban({ children, projectId, active = "board" }) {
  const router = useRouter();

  const handleChangeTab = (key) => {
    if (key === "board") {
      router.push(`/kanban/${projectId}`);
    } else if (key === "my-tasks") {
      router.push(`/kanban/${projectId}/my-tasks`);
    } else if (key === "settings") {
      router.push(`/kanban/${projectId}/settings`);
    } else if (key === "reports") {
      router.push(`/kanban/${projectId}/reports`);
    }
  };

  const tabItems = [
    {
      key: "board",
      label: (
        <Space size={6}>
          <IconLayoutKanban size={16} />
          <span>Board</span>
        </Space>
      ),
    },
    {
      key: "my-tasks",
      label: (
        <Space size={6}>
          <IconUserCheck size={16} />
          <span>Task Saya</span>
        </Space>
      ),
    },
    {
      key: "settings",
      label: (
        <Space size={6}>
          <IconSettings size={16} />
          <span>Pengaturan</span>
        </Space>
      ),
    },
    {
      key: "reports",
      label: (
        <Space size={6}>
          <IconChartBar size={16} />
          <span>Laporan</span>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        activeKey={active}
        onChange={handleChangeTab}
        items={tabItems}
        style={{ marginBottom: 16 }}
      />
      {children}
    </div>
  );
}

export default LayoutKanban;
