import { Stack, Flex, Group, Text } from "@mantine/core";
import { IconEye, IconExternalLink, IconArrowRight } from "@tabler/icons-react";
import { Button, Tooltip } from "antd";
import StatusBadge from "./StatusBadge";
import { getFileUrl, getSiasnDownloadUrl } from "./utils";

const DokumenItem = ({
  dok,
  data,
  pathData,
  transferringDocs,
  onPreview,
  onTransfer,
}) => {
  const fileUrl = data?.[dok.key];
  const fullUrl = getFileUrl(fileUrl);
  const siasnDoc = dok.siasnCode ? pathData?.[dok.siasnCode] : null;
  const siasnUrl = getSiasnDownloadUrl(siasnDoc?.dok_uri);

  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      justify="space-between"
      gap={8}
      py={8}
      px={10}
      style={{
        border: "1px solid #e9ecef",
        borderRadius: 6,
        backgroundColor: fileUrl || siasnDoc ? "#fff" : "#f8f9fa",
      }}
    >
      <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" fw={500}>
          {dok.label}
        </Text>
        <Group gap={4}>
          <StatusBadge isAvailable={!!fileUrl} label="SIMASTER" />
          {dok.siasnCode && (
            <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
          )}
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
        {dok.siasnCode && (
          <>
            <Tooltip title="Lihat SIASN">
              <Button
                size="small"
                type="text"
                disabled={!siasnDoc}
                href={siasnUrl}
                target="_blank"
                icon={<IconExternalLink size={14} />}
              />
            </Tooltip>
            {!siasnDoc && (
              <Tooltip title="Transfer ke SIASN">
                <Button
                  size="small"
                  type="primary"
                  disabled={!fileUrl || transferringDocs[dok.key]}
                  loading={transferringDocs[dok.key]}
                  onClick={() => onTransfer(dok, fullUrl)}
                  icon={<IconArrowRight size={14} />}
                />
              </Tooltip>
            )}
          </>
        )}
      </Group>
    </Flex>
  );
};

export default DokumenItem;

