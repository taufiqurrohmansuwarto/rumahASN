import { useChannelDateRange } from "@/hooks/useRasnChat";
import { Dropdown, DatePicker, Modal } from "antd";
import { Text, Group } from "@mantine/core";
import { IconChevronDown, IconCalendar } from "@tabler/icons-react";
import { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const JumpToDate = ({ channelId, onJumpToDate, currentLabel = "Hari Ini" }) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { data: dateRange } = useChannelDateRange(channelId);

  const handleMenuClick = ({ key }) => {
    let targetDate = null;

    switch (key) {
      case "today":
        targetDate = dayjs().startOf("day").toISOString();
        break;
      case "last_week":
        targetDate = dayjs().subtract(1, "week").startOf("day").toISOString();
        break;
      case "last_month":
        targetDate = dayjs().subtract(1, "month").startOf("day").toISOString();
        break;
      case "specific":
        setDatePickerOpen(true);
        return;
      default:
        return;
    }

    if (targetDate) {
      onJumpToDate?.(targetDate);
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      const targetDate = date.startOf("day").toISOString();
      onJumpToDate?.(targetDate);
      setDatePickerOpen(false);
    }
  };

  const menuItems = [
    {
      key: "header",
      label: (
        <Text size="xs" c="dimmed" fw={500}>
          Lompat ke...
        </Text>
      ),
      disabled: true,
    },
    {
      key: "today",
      label: "Hari Ini",
    },
    {
      key: "last_week",
      label: "Minggu Lalu",
    },
    {
      key: "last_month",
      label: "Bulan Lalu",
    },
    {
      type: "divider",
    },
    {
      key: "specific",
      label: (
        <Group gap={6}>
          <IconCalendar size={14} />
          <span>Pilih Tanggal</span>
        </Group>
      ),
    },
  ];

  // Disable dates outside the channel's message range
  const disabledDate = (current) => {
    if (!dateRange?.oldest || !dateRange?.newest) return false;
    const oldest = dayjs(dateRange.oldest).startOf("day");
    const newest = dayjs(dateRange.newest).endOf("day");
    return current < oldest || current > newest;
  };

  return (
    <>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Group
          gap={4}
          style={{
            cursor: "pointer",
            padding: "4px 12px",
            borderRadius: 20,
            backgroundColor: "#fff",
            border: "1px solid #e8e8e8",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <Text size="xs" fw={500}>
            {currentLabel}
          </Text>
          <IconChevronDown size={14} />
        </Group>
      </Dropdown>

      <Modal
        title="Pilih Tanggal"
        open={datePickerOpen}
        onCancel={() => setDatePickerOpen(false)}
        footer={null}
        width={320}
      >
        <DatePicker
          onChange={handleDateSelect}
          disabledDate={disabledDate}
          style={{ width: "100%" }}
          placeholder="Pilih tanggal"
        />
        {dateRange?.oldest && (
          <Text size="xs" c="dimmed" mt="sm">
            Pesan tersedia dari {dayjs(dateRange.oldest).format("DD MMM YYYY")} sampai{" "}
            {dayjs(dateRange.newest).format("DD MMM YYYY")}
          </Text>
        )}
      </Modal>
    </>
  );
};

export default JumpToDate;
