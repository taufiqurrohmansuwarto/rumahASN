import {
  getNotula,
  updateNotula,
  refineNotula,
} from "@/services/coaching-clinics.services";
import {
  IconDeviceFloppy,
  IconSend,
  IconSparkles,
  IconCheck,
  IconFileText,
  IconExternalLink,
} from "@tabler/icons-react";
import { Box, Group, Stack, Text, Badge } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Input,
  Skeleton,
  Space,
  Tooltip,
  message,
} from "antd";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const { TextArea } = Input;

function NotulaEditor({ meetingId, participants = [], meetingTitle }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const lastSavedRef = useRef(null);

  // Fetch notula
  const { data: notulaData, isLoading } = useQuery(
    ["notula", meetingId],
    () => getNotula(meetingId),
    {
      enabled: !!meetingId,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        if (data?.notula !== undefined) {
          setContent(data.notula);
          lastSavedRef.current = data.notula;
        }
      },
    }
  );

  // Save mutation
  const { mutate: save, isLoading: isSaving } = useMutation(
    (notula) => updateNotula(meetingId, notula),
    {
      onSuccess: () => {
        setIsSaved(true);
        lastSavedRef.current = content;
        message.success("Notula tersimpan");
        queryClient.invalidateQueries(["notula", meetingId]);
      },
      onError: () => {
        message.error("Gagal menyimpan notula");
      },
    }
  );

  // AI Refine mutation - khusus untuk notula
  const { mutate: refine, isLoading: isRefining } = useMutation(
    (text) => refineNotula(meetingId, text),
    {
      onSuccess: (data) => {
        if (data?.refined) {
          setContent(data.refined);
          setIsSaved(false);
          message.success("Notula berhasil dirapikan");
        }
      },
      onError: () => {
        message.error("Gagal merapikan notula");
      },
    }
  );

  // Auto-save with debounce
  const debouncedSave = useCallback(
    debounce((value) => {
      if (value !== lastSavedRef.current) {
        save(value);
      }
    }, 2000),
    [save]
  );

  // Handle content change
  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    setIsSaved(false);
    debouncedSave(value);
  };

  // Manual save
  const handleSave = () => {
    debouncedSave.cancel();
    save(content);
  };

  // Handle AI refine
  const handleRefine = () => {
    if (!content || content.trim() === "") {
      message.warning("Tulis notula terlebih dahulu");
      return;
    }
    refine(content);
  };

  // Handle send - redirect ke compose mail dengan pre-filled data
  const handleSendViaCompose = () => {
    if (!content || content.trim() === "") {
      message.warning("Tulis notula terlebih dahulu");
      return;
    }

    // Simpan notula dulu sebelum redirect
    if (!isSaved) {
      debouncedSave.cancel();
      save(content);
    }

    // Build query params untuk multiple recipients
    // Format: to=id1,id2,id3&toName=name1,name2,name3
    const recipientIds = participants
      ?.map((p) => p?.participant?.custom_id)
      ?.filter(Boolean)
      ?.join(",");
    
    const recipientNames = participants
      ?.map((p) => p?.participant?.username)
      ?.filter(Boolean)
      ?.join(",");

    if (!recipientIds) {
      message.warning("Tidak ada peserta untuk dikirim");
      return;
    }

    // Build compose URL dengan query params
    const params = new URLSearchParams();
    params.set("to", recipientIds);
    params.set("toName", recipientNames);
    params.set("subject", `Notula: ${meetingTitle}`);
    params.set("body", content);
    params.set("from", "coaching-clinic"); // Indicator source

    // Redirect ke compose page
    router.push(`/mails/compose?${params.toString()}`);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  if (isLoading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Group spacing="sm">
            <IconFileText size={20} />
            <span>Notula / Rekap Diskusi</span>
            {notulaData?.sent && (
              <Badge color="green" size="sm">
                Sudah Dikirim
              </Badge>
            )}
          </Group>
        }
        extra={
          <Space>
            {/* Save status indicator */}
            {isSaved ? (
              <Text size="xs" color="dimmed">
                <IconCheck size={14} style={{ marginRight: 4 }} />
                Tersimpan
              </Text>
            ) : (
              <Text size="xs" color="orange">
                Belum tersimpan
              </Text>
            )}

            {/* AI Refine button */}
            <Tooltip title="Rapikan dengan AI (bahasa baku)">
              <Button
                icon={<IconSparkles size={16} />}
                onClick={handleRefine}
                loading={isRefining}
                disabled={!content}
              >
                Rapikan AI
              </Button>
            </Tooltip>

            {/* Save button */}
            <Tooltip title="Simpan">
              <Button
                icon={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                loading={isSaving}
                disabled={isSaved}
              >
                Simpan
              </Button>
            </Tooltip>

            {/* Send button - redirect ke compose mail */}
            <Tooltip title="Kirim ke Peserta via Email">
              <Button
                type="primary"
                icon={<IconExternalLink size={16} />}
                onClick={handleSendViaCompose}
                disabled={!content || participants?.length === 0}
              >
                Kirim Email
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Stack spacing="md">
          {/* Info alert if already sent */}
          {notulaData?.sent && notulaData?.sentAt && (
            <Alert
              type="info"
              showIcon
              message={`Notula terakhir dikirim ${dayjs(notulaData.sentAt).fromNow()}`}
              description="Anda masih bisa mengedit dan mengirim ulang notula"
            />
          )}

          {/* Text editor */}
          <TextArea
            value={content}
            onChange={handleContentChange}
            placeholder="Tulis rekap/notula hasil diskusi coaching clinic di sini...

Contoh:
- Topik yang dibahas
- Poin-poin penting
- Kesimpulan dan action items
- Catatan tambahan"
            autoSize={{ minRows: 12, maxRows: 24 }}
            style={{ fontSize: 14 }}
          />

          {/* Last updated info */}
          {notulaData?.updatedAt && (
            <Text size="xs" color="dimmed">
              Terakhir diupdate: {dayjs(notulaData.updatedAt).format("DD MMMM YYYY HH:mm")}
            </Text>
          )}
        </Stack>
      </Card>
    </>
  );
}

export default NotulaEditor;
