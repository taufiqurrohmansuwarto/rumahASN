import { Text } from "@mantine/core";

// Komponen untuk render item di Transfer
export const renderTransferItem = (item) => {
  return {
    label: (
      <div style={{ lineHeight: "1.1", flex: 1 }}>
        <div>
          <Text size="sm" fw={500}>
            {item.username || item.nama || "-"}
          </Text>
        </div>
        {item.opdId && (
          <div style={{ marginTop: "2px" }}>
            <Text size="10px" c="dimmed">
              OPD: {item.opdId}
            </Text>
          </div>
        )}
      </div>
    ),
    value: item.title,
  };
};

