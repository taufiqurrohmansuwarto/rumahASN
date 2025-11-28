import { Stack, Flex, Text, Alert, Progress } from "@mantine/core";
import { IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import { Button, Modal } from "antd";

const SyncProgressModal = ({
  open,
  isSyncing,
  progress,
  results,
  onClose,
}) => {
  const handleClose = () => {
    if (!isSyncing) {
      onClose();
    }
  };

  return (
    <Modal
      title="Sinkronisasi Dokumen Penting"
      open={open}
      onCancel={handleClose}
      footer={
        !isSyncing ? (
          <Button type="primary" onClick={handleClose}>
            Tutup
          </Button>
        ) : null
      }
      closable={!isSyncing}
      maskClosable={false}
      width={450}
      centered
    >
      <Stack gap="sm">
        {isSyncing && (
          <>
            <Text size="sm" fw={500}>
              Sedang menyinkronkan dokumen...
            </Text>
            <Progress
              value={
                progress.total > 0
                  ? (progress.current / progress.total) * 100
                  : 0
              }
              size="lg"
              radius="xl"
              striped
              animated
            />
            <Text size="xs" c="dimmed" ta="center">
              {progress.current} dari {progress.total} dokumen
            </Text>
          </>
        )}

        {results.length > 0 && (
          <Stack gap={4}>
            <Text size="xs" fw={500}>
              Hasil Sinkronisasi:
            </Text>
            {results.map((result, idx) => (
              <Flex
                key={idx}
                align="center"
                gap={6}
                py={4}
                px={8}
                style={{
                  backgroundColor:
                    result.status === "success" ? "#f0fdf4" : "#fef2f2",
                  borderRadius: 4,
                  border: `1px solid ${
                    result.status === "success" ? "#bbf7d0" : "#fecaca"
                  }`,
                }}
              >
                {result.status === "success" ? (
                  <IconCircleCheck size={14} color="#16a34a" />
                ) : (
                  <IconAlertTriangle size={14} color="#dc2626" />
                )}
                <Text size="xs" style={{ flex: 1 }}>
                  {result.label}
                </Text>
                <Text
                  size={10}
                  c={result.status === "success" ? "green" : "red"}
                >
                  {result.status === "success" ? "Berhasil" : result.message}
                </Text>
              </Flex>
            ))}
          </Stack>
        )}

        {!isSyncing && results.length > 0 && (
          <Alert color="blue" variant="light" p="xs" radius="sm">
            <Text size="xs">
              Proses sinkronisasi selesai. Silakan cek kembali dokumen yang
              sudah diupload ke SIASN.
            </Text>
          </Alert>
        )}
      </Stack>
    </Modal>
  );
};

export default SyncProgressModal;

