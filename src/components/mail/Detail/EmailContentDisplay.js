import { ActionIcon, Box, Center, Group, Text } from "@mantine/core";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconCopy,
} from "@tabler/icons-react";
import { message, Tooltip } from "antd";
import { useState } from "react";

const EmailContentDisplay = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) {
    return (
      <Center py="xl">
        <Text c="dimmed" fs="italic" size="sm">
          Email ini tidak memiliki konten
        </Text>
      </Center>
    );
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(content)
      .then(() => message.success("Disalin"))
      .catch(() => message.error("Gagal menyalin"));
  };

  // Process quoted content
  const processContent = (text) => {
    const parts = text.split(/(Pada .+? menulis:|On .+? wrote:)/);
    const processed = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.match(/Pada .+? menulis:|On .+? wrote:/)) {
        processed.push({ type: "quote-header", content: part });
      } else if (
        i > 0 &&
        parts[i - 1]?.match(/Pada .+? menulis:|On .+? wrote:/)
      ) {
        processed.push({ type: "quoted", content: part });
      } else {
        processed.push({ type: "regular", content: part });
      }
    }
    return processed;
  };

  const renderContent = () => {
    const processed = processContent(content);

    return processed.map((part, index) => {
      if (part.type === "quote-header") {
        return (
          <Text key={index} size="xs" c="dimmed" fs="italic" mt="md" mb="xs">
            {part.content}
          </Text>
        );
      } else if (part.type === "quoted") {
        return (
          <Box
            key={index}
            ml="xs"
            pl="sm"
            py="xs"
            mb="sm"
            style={{
              borderLeft: "2px solid #228be6",
              backgroundColor: "#f8f9fa",
              borderRadius: "0 4px 4px 0",
            }}
          >
            <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
              {part.content}
            </Text>
          </Box>
        );
      }
      return (
        <Text
          key={index}
          size="sm"
          style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
          mb="sm"
        >
          {part.content}
        </Text>
      );
    });
  };

  return (
    <Box mb="md">
      <Group justify="flex-end" mb="xs">
        <Tooltip title="Salin">
          <ActionIcon variant="subtle" size="sm" onClick={handleCopy}>
            <IconCopy size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip title={isExpanded ? "Kecilkan" : "Perbesar"}>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <IconArrowsMinimize size={14} />
            ) : (
              <IconArrowsMaximize size={14} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>

      <Box
        p="md"
        style={{
          minHeight: isExpanded ? "50vh" : 150,
          position: isExpanded ? "fixed" : "relative",
          top: isExpanded ? 60 : "auto",
          left: isExpanded ? 60 : "auto",
          right: isExpanded ? 60 : "auto",
          bottom: isExpanded ? 60 : "auto",
          zIndex: isExpanded ? 1000 : "auto",
          backgroundColor: "#fff",
          borderRadius: 6,
          boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.15)" : "none",
          overflow: "auto",
        }}
      >
        {renderContent()}
      </Box>

      {isExpanded && (
        <Box
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            zIndex: 999,
          }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </Box>
  );
};

export default EmailContentDisplay;
