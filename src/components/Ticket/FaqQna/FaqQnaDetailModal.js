import {
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Collapse, Modal } from "antd";
import dayjs from "dayjs";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";

const { Panel } = Collapse;

function FaqQnaDetailModal({ open, onClose, data }) {
  if (!data) return null;

  return (
    <Modal
      title="Detail FAQ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Stack spacing="md">
        {/* Header Info */}
        <Group position="apart">
          <Group spacing="xs">
            <Text size="sm" color="dimmed">
              ID:
            </Text>
            <Text size="sm" weight={600}>
              #{data.id}
            </Text>
          </Group>
          <Badge color="blue" variant="filled">
            v{data.version || 1}
          </Badge>
        </Group>

        <Divider />

        {/* Pertanyaan & Jawaban - Collapsible */}
        <Collapse defaultActiveKey={["1", "2"]} ghost>
          <Panel header={<Text size="sm" weight={500}>Pertanyaan</Text>} key="1">
            <Text size="sm" weight={600}>
              {data.question}
            </Text>
          </Panel>
          <Panel header={<Text size="sm" weight={500}>Jawaban</Text>} key="2">
            <ReactMarkdownCustom>{data.answer}</ReactMarkdownCustom>
          </Panel>
        </Collapse>

        <Divider />

        {/* Info Grid */}
        <Group grow spacing="md">
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Status
            </Text>
            <Badge color={data.is_active ? "green" : "gray"} variant="dot">
              {data.is_active ? "Aktif" : "Nonaktif"}
            </Badge>
          </Box>
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Skor
            </Text>
            <Text size="sm">{data.confidence_score || 1.0}</Text>
          </Box>
        </Group>

        {/* Dates */}
        <Group grow spacing="md">
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Mulai Berlaku
            </Text>
            <Text size="sm">
              {data.effective_date
                ? dayjs(data.effective_date).format("DD MMM YYYY")
                : "-"}
            </Text>
          </Box>
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Berakhir
            </Text>
            <Text size="sm">
              {data.expired_date
                ? dayjs(data.expired_date).format("DD MMM YYYY")
                : "-"}
            </Text>
          </Box>
        </Group>

        {/* Referensi */}
        <Box>
          <Text size="xs" color="dimmed" mb={4}>
            Referensi
          </Text>
          <Text size="sm">{data.regulation_ref || "-"}</Text>
        </Box>

        {/* Kategori */}
        {data.sub_categories?.length > 0 && (
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Kategori
            </Text>
            <Group spacing="xs">
              {data.sub_categories.map((sc) => (
                <Badge key={sc.id} color="blue" variant="light">
                  {sc.name}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        {/* Tags */}
        {data.tags?.length > 0 && (
          <Box>
            <Text size="xs" color="dimmed" mb={4}>
              Tags
            </Text>
            <Group spacing="xs">
              {data.tags.map((tag, idx) => (
                <Badge key={idx} color="gray" variant="outline">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Box>
        )}

        <Divider />

        {/* Metadata */}
        <Paper p="xs" withBorder>
          <Stack spacing={8}>
            <Group position="apart">
              <Text size="xs" color="dimmed">
                Dibuat
              </Text>
              <Text size="xs">
                {data.created_by?.split("|")[1] || data.created_by || "-"} •{" "}
                {dayjs(data.created_at).format("DD MMM YYYY HH:mm")}
              </Text>
            </Group>
            {data.updated_by && (
              <Group position="apart">
                <Text size="xs" color="dimmed">
                  Diubah
                </Text>
                <Text size="xs">
                  {data.updated_by?.split("|")[1] || data.updated_by} •{" "}
                  {dayjs(data.updated_at).format("DD MMM YYYY HH:mm")}
                </Text>
              </Group>
            )}
            {data.previous_version_id && (
              <Group position="apart">
                <Text size="xs" color="dimmed">
                  Versi Sebelumnya
                </Text>
                <Badge size="xs">v{(data.version || 1) - 1}</Badge>
              </Group>
            )}
            {data.qdrant_point_id && (
              <Group position="apart">
                <Text size="xs" color="dimmed">
                  Qdrant ID
                </Text>
                <Text size="xs" color="violet">
                  {data.qdrant_point_id}
                </Text>
              </Group>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Modal>
  );
}

export default FaqQnaDetailModal;

