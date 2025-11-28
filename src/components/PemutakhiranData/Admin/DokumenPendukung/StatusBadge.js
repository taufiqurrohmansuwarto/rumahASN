import { Badge, Center } from "@mantine/core";
import { IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";

const StatusBadge = ({ isAvailable, label, colorAvailable = "green" }) => (
  <Badge
    size="xs"
    color={isAvailable ? colorAvailable : "red"}
    variant={isAvailable ? "filled" : "light"}
    leftSection={
      <Center style={{ width: 10, height: 10 }}>
        {isAvailable ? (
          <IconCircleCheck size={10} style={{ display: "block" }} />
        ) : (
          <IconAlertTriangle size={10} style={{ display: "block" }} />
        )}
      </Center>
    }
    styles={{
      root: { paddingLeft: 6 },
      section: { marginRight: 4 },
    }}
  >
    {label}
  </Badge>
);

export default StatusBadge;

