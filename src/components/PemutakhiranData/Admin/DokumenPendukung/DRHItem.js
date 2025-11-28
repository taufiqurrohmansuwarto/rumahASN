import { Stack, Flex, Group, Text } from "@mantine/core";
import {
  IconArrowRight,
  IconExternalLink,
  IconFileText,
  IconUpload,
} from "@tabler/icons-react";
import { Button, Tooltip, Upload } from "antd";
import StatusBadge from "./StatusBadge";
import { getSiasnDownloadUrl } from "./utils";

const DRHItem = ({
  dok,
  pathData,
  cvData,
  transferringDocs,
  onPreview,
  onTransferCV,
  onUploadManual,
}) => {
  const siasnDoc = pathData?.[dok.siasnCode];
  const siasnUrl = getSiasnDownloadUrl(siasnDoc?.dok_uri);
  const hasCVData = !!cvData?.data;

  return (
    <Stack
      gap={4}
      py={8}
      px={10}
      style={{
        border: "1px solid #e9ecef",
        borderRadius: 6,
        backgroundColor: siasnDoc ? "#fff" : "#f8f9fa",
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
            <StatusBadge
              isAvailable={hasCVData}
              label="CV SIASN"
              colorAvailable="blue"
            />
            <StatusBadge isAvailable={!!siasnDoc} label="SIASN" />
          </Group>
        </Stack>

        <Group gap={4} wrap="nowrap">
          {hasCVData && (
            <Tooltip title="Lihat CV SIASN">
              <Button
                size="small"
                type="text"
                icon={<IconFileText size={14} />}
                onClick={() =>
                  onPreview({ label: "CV SIASN", url: cvData.data })
                }
              />
            </Tooltip>
          )}
          {siasnDoc && (
            <Tooltip title="Lihat SIASN">
              <Button
                size="small"
                type="text"
                href={siasnUrl}
                target="_blank"
                icon={<IconExternalLink size={14} />}
              />
            </Tooltip>
          )}
          {!siasnDoc && (
            <>
              {hasCVData ? (
                <Tooltip title="Transfer CV ke SIASN">
                  <Button
                    size="small"
                    type="primary"
                    loading={transferringDocs[dok.key]}
                    icon={<IconArrowRight size={14} />}
                    onClick={() => onTransferCV(dok)}
                  />
                </Tooltip>
              ) : (
                <Upload
                  accept=".pdf"
                  showUploadList={false}
                  beforeUpload={(file) => onUploadManual(file, dok)}
                >
                  <Tooltip title="Upload Manual">
                    <Button
                      size="small"
                      type="primary"
                      loading={transferringDocs[dok.key]}
                      icon={<IconUpload size={14} />}
                    />
                  </Tooltip>
                </Upload>
              )}
            </>
          )}
        </Group>
      </Flex>
      <Text size={10} c="dimmed" fs="italic">
        DRH dapat menggunakan CV SIMASTER atau transfer dari CV SIASN. Pastikan
        data sudah benar sebelum transfer.
      </Text>
    </Stack>
  );
};

export default DRHItem;

