import { Stack, Flex, Group, Text } from "@mantine/core";
import { IconEye, IconExternalLink, IconArrowRight } from "@tabler/icons-react";
import { Button, Modal, Tooltip, message } from "antd";
import StatusBadge from "./StatusBadge";
import { getFileUrl, getSiasnDownloadUrl } from "./utils";

const PertekItem = ({
  dok,
  data,
  pathData,
  transferringDocs,
  onPreview,
  onTransfer,
}) => {
  const fileUrl = data?.[dok.key];
  const fullUrl = getFileUrl(fileUrl);
  const siasnDoc = pathData?.[dok.siasnCode];
  const siasnUrl = getSiasnDownloadUrl(siasnDoc?.dok_uri);

  // Gunakan kombinasi dok.key dan sourceKey untuk loading key yang unik
  const getLoadingKey = (sourceKey) => `${dok.key}_${sourceKey}`;

  const handleTransferWithSource = (sourceKey, sourceLabel) => {
    const srcFileUrl = data?.[sourceKey];
    const srcFullUrl = getFileUrl(srcFileUrl);
    const loadingKey = getLoadingKey(sourceKey);

    if (!srcFileUrl) {
      message.error(`File ${sourceLabel} tidak tersedia`);
      return;
    }

    Modal.confirm({
      title: `Transfer ${dok.label}`,
      content: `Transfer dari ${sourceLabel} ke SIASN dengan kode dokumen ${dok.siasnCode}?`,
      okText: "Ya, Transfer",
      cancelText: "Batal",
      onOk: () => onTransfer(dok, srcFullUrl, loadingKey),
    });
  };

  return (
    <Stack
      gap={4}
      py={8}
      px={10}
      style={{
        border: "1px solid #e9ecef",
        borderRadius: 6,
        backgroundColor: fileUrl || siasnDoc ? "#fff" : "#f8f9fa",
      }}
    >
      <Flex
        direction={{ base: "column", sm: "row" }}
        align={{ base: "stretch", sm: "center" }}
        justify="space-between"
        gap={8}
      >
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Text size="xs" fw={500}>
            {dok.label}
          </Text>
          <Group gap={4}>
            <StatusBadge isAvailable={!!fileUrl} label="SIMASTER" />
            {dok.sourceOptions?.map((src) => (
              <StatusBadge
                key={src.key}
                isAvailable={!!data?.[src.key]}
                label={src.label}
              />
            ))}
            <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
          <Tooltip title="Lihat SIMASTER">
            <Button
              size="small"
              type="text"
              disabled={!fileUrl}
              onClick={() => onPreview({ label: dok.label, url: fullUrl })}
              icon={<IconEye size={14} />}
            />
          </Tooltip>
          {siasnDoc ? (
            <Tooltip title="Lihat SIASN">
              <Button
                size="small"
                type="text"
                href={siasnUrl}
                target="_blank"
                icon={<IconExternalLink size={14} />}
              />
            </Tooltip>
          ) : (
            <>
              {dok.sourceOptions?.map((src) => {
                const loadingKey = getLoadingKey(src.key);
                return (
                  <Tooltip key={src.key} title={`Transfer dari ${src.label}`}>
                    <Button
                      size="small"
                      type={src.key === "file_cpns" ? "primary" : "default"}
                      disabled={
                        !data?.[src.key] || transferringDocs[loadingKey]
                      }
                      loading={transferringDocs[loadingKey]}
                      icon={<IconArrowRight size={14} />}
                      onClick={() =>
                        handleTransferWithSource(src.key, src.label)
                      }
                    />
                  </Tooltip>
                );
              })}
            </>
          )}
        </Group>
      </Flex>
      <Text size={10} c="dimmed" fs="italic">
        Jika tidak ada Pertek, dapat diganti dengan SK CPNS yang memuat Pertek
      </Text>
    </Stack>
  );
};

export default PertekItem;

