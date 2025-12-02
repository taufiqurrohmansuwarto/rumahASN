import {
  useAssignLabel,
  useEmailLabels,
  useRemoveLabel,
  useUserLabels,
} from "@/hooks/useEmails";
import { Box, Group, Popover, Stack, Text } from "@mantine/core";
import { IconTag } from "@tabler/icons-react";
import { Button, Checkbox, Spin, Tag } from "antd";
import { useState } from "react";

const EmailLabelSelector = ({ emailId, onRefresh, disabled = false }) => {
  const [opened, setOpened] = useState(false);

  const { data: allLabelsData, isLoading: labelsLoading } = useUserLabels();
  const { data: emailLabelsData, isLoading: emailLabelsLoading } = useEmailLabels(emailId);
  const assignMutation = useAssignLabel();
  const removeMutation = useRemoveLabel();

  const allLabels = allLabelsData?.data || [];
  const emailLabels = emailLabelsData?.data || [];
  const emailLabelIds = emailLabels.map((label) => label.id);

  const handleLabelToggle = async (label, checked) => {
    if (checked) {
      await assignMutation.mutateAsync({ emailId, labelId: label.id });
    } else {
      await removeMutation.mutateAsync({ emailId, labelId: label.id });
    }
    onRefresh?.();
  };

  const isLoading = labelsLoading || emailLabelsLoading || assignMutation.isLoading || removeMutation.isLoading;

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom-end" width={220} withArrow>
      <Popover.Target>
        <Button
          type="text"
          size="small"
          disabled={disabled}
          onClick={() => setOpened((o) => !o)}
          icon={<IconTag size={14} />}
        >
          Label
          {emailLabels.length > 0 && (
            <Tag style={{ marginLeft: 4 }}>{emailLabels.length}</Tag>
          )}
        </Button>
      </Popover.Target>

      <Popover.Dropdown p={8}>
        {isLoading ? (
          <Box ta="center" py="sm">
            <Spin size="small" />
          </Box>
        ) : (
          <Stack gap={2}>
            {allLabels.length === 0 ? (
              <Text size="xs" c="dimmed" ta="center" py="sm">
                Belum ada label
              </Text>
            ) : (
              allLabels.map((label) => {
                const isAssigned = emailLabelIds.includes(label.id);
                return (
                  <Box
                    key={label.id}
                    py={6}
                    px={8}
                    style={{
                      borderRadius: 4,
                      backgroundColor: isAssigned ? "#e6f4ff" : "transparent",
                      cursor: "pointer",
                      ":hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={() => handleLabelToggle(label, !isAssigned)}
                  >
                    <Group gap={8}>
                      <Checkbox checked={isAssigned} onChange={() => {}} />
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: label.color,
                        }}
                      />
                      <Text size="xs" fw={isAssigned ? 500 : 400}>
                        {label.name}
                      </Text>
                      {label.is_system && (
                        <Text size="xs" c="dimmed">(System)</Text>
                      )}
                    </Group>
                  </Box>
                );
              })
            )}
          </Stack>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default EmailLabelSelector;
