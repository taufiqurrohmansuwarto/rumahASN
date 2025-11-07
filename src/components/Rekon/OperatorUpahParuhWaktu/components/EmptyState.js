import { TeamOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";

export const EmptyState = () => {
  return (
    <div style={{ padding: "60px", textAlign: "center" }}>
      <TeamOutlined
        style={{
          fontSize: 64,
          color: "#d1d5db",
          marginBottom: 24,
        }}
      />
      <div>
        <Text size="lg" c="dimmed">
          Pilih Unit Organisasi
        </Text>
      </div>
      <div style={{ marginTop: "8px" }}>
        <Text size="sm" c="dimmed">
          Pilih unit organisasi untuk melihat dan mengelola operator
        </Text>
      </div>
    </div>
  );
};

