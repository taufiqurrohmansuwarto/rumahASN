import { ActionIcon, Group, Paper } from "@mantine/core";
import { IconBold, IconItalic, IconList } from "@tabler/icons-react";
import { Input, Tooltip } from "antd";
import { useRef } from "react";

const SimpleMarkdownEditor = ({ value, onChange, placeholder, rows = 6 }) => {
  const textareaRef = useRef(null);

  const insertMarkdown = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value?.substring(start, end) || "";
    const before = value?.substring(0, start) || "";
    const after = value?.substring(end) || "";

    if (selectedText) {
      const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 0);
    } else {
      const newText = `${before}${prefix}${suffix}${after}`;
      onChange(newText);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length
        );
      }, 0);
    }
  };

  const insertList = () => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = value?.substring(0, start) || "";
    const after = value?.substring(start) || "";
    const needsNewline = before.length > 0 && !before.endsWith("\n");

    const listItem = `${needsNewline ? "\n" : ""}- `;
    const newText = `${before}${listItem}${after}`;
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + listItem.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <Paper withBorder radius="sm" p={0}>
      <Group
        gap={4}
        p={4}
        style={{ borderBottom: "1px solid #e9ecef", background: "#fafafa" }}
      >
        <Tooltip title="Tebal (**)">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => insertMarkdown("**")}
          >
            <IconBold size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip title="Miring (*)">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => insertMarkdown("*")}
          >
            <IconItalic size={14} />
          </ActionIcon>
        </Tooltip>
        <Tooltip title="List (-)">
          <ActionIcon variant="subtle" size="sm" onClick={insertList}>
            <IconList size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Input.TextArea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ resize: "none", border: "none" }}
        bordered={false}
      />
    </Paper>
  );
};

export default SimpleMarkdownEditor;
