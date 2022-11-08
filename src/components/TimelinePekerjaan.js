import { Paper, Stack, Text, Timeline } from "@mantine/core";
import { IconCircleCheck, IconCirclePlus, IconUserCircle } from "@tabler/icons";
import { formatDate, setActivePekerjaan } from "../../utils";

function TimelinePekerjaan({ data }) {
  return (
    <Paper radius="lg" shadow="lg" p="lg">
      <Stack>
        <Text weight={800}>{data?.ticket_number}</Text>
        <Timeline
          active={setActivePekerjaan(data)}
          bulletSize={24}
          lineWidth={2}
        >
          <Timeline.Item bullet={<IconCirclePlus size={18} />} title="Diajukan">
            <Text color="dimmed" size="sm">
              Status tiket diajukan oleh {data?.customer?.username}
            </Text>
            <Text size="xs" mt={4}>
              {formatDate(data?.created_at)}
            </Text>
          </Timeline.Item>

          <Timeline.Item
            bullet={<IconUserCircle size={18} />}
            title="Dikerjakan"
          >
            {data?.status_code === "DIKERJAKAN" ||
            data?.status_code === "SELESAI" ? (
              <>
                <Text color="dimmed" size="sm">
                  Status tiket mu dikerjakan oleh {data?.agent?.username}
                </Text>
                <Text size="xs" mt={4}>
                  {formatDate(data?.start_work_at)}
                </Text>
              </>
            ) : (
              <Text color="dimmed" size="sm">
                Belum dikerjakan
              </Text>
            )}
          </Timeline.Item>
          <Timeline.Item
            title="Selesai"
            bullet={<IconCircleCheck size={26} />}
            lineVariant="dashed"
          >
            {data?.status_code === "SELESAI" ? (
              <>
                <Text color="dimmed" size="sm">
                  Status tiket diselesaikan oleh {data?.agent?.username}
                </Text>
                <Text size="xs" mt={4}>
                  {formatDate(data?.completed_at)}
                </Text>
              </>
            ) : (
              <Text color="dimmed" size="sm">
                Belum Selesai
              </Text>
            )}
          </Timeline.Item>
        </Timeline>
      </Stack>
    </Paper>
  );
}

export default TimelinePekerjaan;
