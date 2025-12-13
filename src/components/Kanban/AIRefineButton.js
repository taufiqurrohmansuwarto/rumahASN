import { useState } from "react";
import { Button, Tooltip, Popover, Flex, Typography, message, Spin } from "antd";
import { IconSparkles, IconCheck } from "@tabler/icons-react";
import { aiRefineText } from "../../../services/kanban.services";

const { Text } = Typography;

/**
 * Tombol AI untuk merapikan teks judul/deskripsi
 * UI sederhana: klik → loading → popover hasil → klik untuk apply
 */
function AIRefineButton({ value, type, onApply, disabled }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(false);

  const handleRefine = async () => {
    if (!value?.trim()) {
      message.warning("Isi teks terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await aiRefineText({ text: value, type });
      if (response?.success && response?.data?.refined) {
        setResult(response.data.refined);
        setOpen(true);
      }
    } catch (error) {
      message.error("Gagal merapikan teks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      setOpen(false);
      setResult(null);
      message.success("Teks berhasil diperbarui");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
  };

  const popoverContent = (
    <div style={{ maxWidth: 300 }}>
      <Text style={{ fontSize: 12, display: "block", marginBottom: 8 }}>
        {result}
      </Text>
      <Flex gap={8} justify="flex-end">
        <Button size="small" onClick={handleClose}>
          Batal
        </Button>
        <Button
          type="primary"
          size="small"
          icon={<IconCheck size={12} />}
          onClick={handleApply}
          style={{ backgroundColor: "#fa541c", borderColor: "#fa541c" }}
        >
          Terapkan
        </Button>
      </Flex>
    </div>
  );

  return (
    <Popover
      content={popoverContent}
      title={
        <Text style={{ fontSize: 12, fontWeight: 500 }}>
          ✨ Hasil AI
        </Text>
      }
      trigger="click"
      open={open}
      onOpenChange={(visible) => !visible && handleClose()}
      placement="bottomRight"
    >
      <Tooltip title="Rapikan dengan AI">
        <Button
          type="text"
          size="small"
          icon={
            isLoading ? (
              <Spin size="small" />
            ) : (
              <IconSparkles size={14} />
            )
          }
          onClick={handleRefine}
          disabled={disabled || isLoading || !value?.trim()}
          style={{
            color: disabled || !value?.trim() ? "#bfbfbf" : "#fa541c",
            padding: "0 4px",
            height: 22,
            minWidth: 22,
          }}
        />
      </Tooltip>
    </Popover>
  );
}

export default AIRefineButton;

