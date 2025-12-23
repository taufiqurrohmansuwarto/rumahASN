import {
  cancelRequestMeeting,
  requestMeeting,
  searchMentoringByCode,
} from "@/services/coaching-clinics.services";
import {
  IconCalendar,
  IconClock,
  IconSearch,
  IconUsers,
  IconUserCheck,
  IconX,
  IconCheck,
  IconVideo,
  IconEye,
} from "@tabler/icons-react";
import {
  Box,
  Flex,
  Group,
  Stack,
  Text,
  Badge as MantineBadge,
  Progress as MantineProgress,
  Paper,
  Center,
  Divider,
} from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Tag,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

// Status color helper
const getStatusConfig = (status) => {
  switch (status) {
    case "end":
      return { color: "red", label: "Selesai", mantineColor: "red" };
    case "upcoming":
      return { color: "blue", label: "Akan Datang", mantineColor: "blue" };
    case "live":
      return {
        color: "green",
        label: "Sedang Berlangsung",
        mantineColor: "green",
      };
    default:
      return {
        color: "default",
        label: status?.toUpperCase(),
        mantineColor: "gray",
      };
  }
};

// Modal untuk form alasan mendaftar
const ModalDaftarMentoring = ({
  open,
  onCancel,
  onSubmit,
  isLoading,
  meeting,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({ id: meeting?.id, data: { reason: values.reason } });
      form.resetFields();
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={
        <Group spacing="sm">
          <IconUserCheck size={20} color="#52c41a" />
          <Text weight={600}>Daftar Coaching Clinic</Text>
        </Group>
      }
      okText="Daftar Sekarang"
      cancelText="Batal"
      onOk={handleSubmit}
      confirmLoading={isLoading}
      centered
      destroyOnClose
    >
      <Stack spacing="md">
        <Paper p="md" radius="md" withBorder>
          <Group spacing="sm">
            <Avatar size={40} src={meeting?.coach?.image} />
            <Box>
              <Text weight={600} size="sm">
                {meeting?.title}
              </Text>
              <Text size="xs" color="dimmed">
                Coach: {meeting?.coach?.username}
              </Text>
            </Box>
          </Group>
        </Paper>

        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Alasan Mengikuti Coaching Clinic"
            rules={[
              {
                required: true,
                message: "Silakan isi alasan mengikuti coaching clinic",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Jelaskan alasan Anda ingin mengikuti coaching clinic ini..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Stack>
    </Modal>
  );
};

// Card hasil pencarian yang lebih clean
const MentoringResultCard = ({
  data,
  isRegistered,
  onRegister,
  onUnregister,
  onViewDetails,
  isLoadingRegister,
  isLoadingUnregister,
}) => {
  const statusConfig = getStatusConfig(data?.status);
  const currentParticipants = data?.currentMeetingParticipants || 0;
  const maxParticipants = data?.max_participants || 0;
  const progress =
    maxParticipants > 0 ? (currentParticipants / maxParticipants) * 100 : 0;
  const isFull = currentParticipants >= maxParticipants;
  const canRegister =
    !isRegistered &&
    !isFull &&
    (data?.status === "upcoming" || data?.status === "live");

  return (
    <Paper radius="lg" withBorder sx={{ overflow: "hidden" }}>
      {/* Header dengan gradient */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: 20,
          position: "relative",
        }}
      >
        {/* Status badge */}
        <MantineBadge
          color={statusConfig.mantineColor}
          variant="filled"
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          {statusConfig.label}
        </MantineBadge>

        {/* Coach avatar & title */}
        <Flex direction="column" align="center" gap="xs">
          <Avatar
            size={56}
            src={data?.coach?.image}
            style={{ border: "3px solid white" }}
          />
          <Text color="white" weight={700} size="lg" align="center">
            {data?.title}
          </Text>
          <Text color="rgba(255,255,255,0.85)" size="sm">
            {data?.coach?.username}
          </Text>
        </Flex>
      </Box>

      {/* Content */}
      <Box p="md">
        <Stack spacing="sm">
          {/* Description */}
          {data?.description && (
            <Text size="sm" color="dimmed" lineClamp={2}>
              {data?.description}
            </Text>
          )}

          <Divider />

          {/* Info grid */}
          <Stack spacing="xs">
            <Group spacing="xs">
              <IconCalendar size={16} color="#667eea" />
              <Text size="sm" weight={500}>
                {dayjs(data?.start_date).format("DD MMMM YYYY")}
              </Text>
            </Group>

            <Group spacing="xs">
              <IconClock size={16} color="#667eea" />
              <Text size="sm" weight={500}>
                {data?.start_hours} - {data?.end_hours}
              </Text>
            </Group>

            <Group spacing="xs">
              <IconUsers size={16} color="#667eea" />
              <Group spacing={4}>
                {data?.participants_type?.map((type, idx) => (
                  <Tag key={idx} color="gold" style={{ margin: 0 }}>
                    {type}
                  </Tag>
                ))}
              </Group>
            </Group>
          </Stack>

          <Divider />

          {/* Participants progress */}
          <Box>
            <Group position="apart" mb={4}>
              <Text size="xs" color="dimmed">
                Peserta Terdaftar
              </Text>
              <Text size="xs" weight={600}>
                {currentParticipants} / {maxParticipants}
              </Text>
            </Group>
            <MantineProgress
              value={progress}
              color={isFull ? "red" : "violet"}
              size="sm"
              radius="xl"
            />
            {isFull && (
              <Text size="xs" color="red" mt={4}>
                Kuota peserta sudah penuh
              </Text>
            )}
          </Box>

          {/* Action buttons */}
          <Group grow mt="xs">
            {isRegistered ? (
              <>
                <Button icon={<IconEye size={16} />} onClick={onViewDetails}>
                  Lihat Detail
                </Button>
                <Button
                  danger
                  icon={<IconX size={16} />}
                  onClick={onUnregister}
                  loading={isLoadingUnregister}
                >
                  Batal Daftar
                </Button>
              </>
            ) : canRegister ? (
              <Button
                type="primary"
                icon={<IconCheck size={16} />}
                onClick={onRegister}
                loading={isLoadingRegister}
                block
              >
                Daftar Coaching Clinic
              </Button>
            ) : (
              <Button disabled block>
                {isFull ? "Kuota Penuh" : "Tidak Tersedia"}
              </Button>
            )}
          </Group>
        </Stack>
      </Box>
    </Paper>
  );
};

// Main Modal Pencarian
const ModalPencarian = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [code, setCode] = useState("");
  const [showDaftarModal, setShowDaftarModal] = useState(false);

  const {
    data: dataMentoring,
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
  } = useQuery(["mentoring", code], () => searchMentoringByCode(code), {
    enabled: !!code,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: gabungMentoring, isLoading: isLoadingGabung } =
    useMutation(({ id, data }) => requestMeeting({ id, data }), {
      onSuccess: () => {
        queryClient.invalidateQueries(["mentoring", code]);
        queryClient.invalidateQueries(["meetings"]);
        message.success(
          "Selamat! Anda berhasil mendaftar coaching clinic ini."
        );
        setShowDaftarModal(false);
      },
      onError: (error) => {
        message.error(
          `Gagal mendaftar: ${
            error?.response?.data?.message || "Terjadi kesalahan"
          }`
        );
      },
    });

  const { mutateAsync: batalMentoring, isLoading: isLoadingBatal } =
    useMutation((id) => cancelRequestMeeting(id), {
      onSuccess: () => {
        queryClient.invalidateQueries(["mentoring", code]);
        queryClient.invalidateQueries(["meetings"]);
        message.success("Berhasil membatalkan pendaftaran");
      },
      onError: () => {
        message.error("Gagal membatalkan pendaftaran");
      },
    });

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setCode(values.code?.trim());
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleRegister = () => {
    setShowDaftarModal(true);
  };

  const handleUnregister = () => {
    Modal.confirm({
      title: "Batalkan Pendaftaran",
      content:
        "Apakah Anda yakin ingin membatalkan pendaftaran coaching clinic ini?",
      okText: "Ya, Batalkan",
      cancelText: "Tidak",
      okButtonProps: { danger: true },
      centered: true,
      onOk: async () => {
        await batalMentoring(dataMentoring?.id);
      },
    });
  };

  const handleViewDetails = () => {
    router.push(`/coaching-clinic/${dataMentoring?.current_meeting_id}/detail`);
    onCancel();
  };

  const handleReset = () => {
    setCode("");
    form.resetFields();
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        title={
          <Group spacing="sm">
            <IconSearch size={20} color="#667eea" />
            <Text weight={600}>Cari Coaching Clinic</Text>
          </Group>
        }
        footer={null}
        width={440}
        centered
        destroyOnClose
      >
        <Stack spacing="lg">
          {/* Search Form */}
          <Form form={form} onFinish={handleSearch}>
            <Form.Item
              name="code"
              rules={[{ required: true, message: "Masukkan kode mentoring" }]}
              style={{ marginBottom: 0 }}
            >
              <Input.Search
                placeholder="Masukkan kode mentoring..."
                enterButton={
                  <Button
                    type="primary"
                    icon={<IconSearch size={16} />}
                    loading={isFetchingSearch}
                  >
                    Cari
                  </Button>
                }
                size="large"
                onSearch={handleSearch}
                allowClear
              />
            </Form.Item>
          </Form>

          {/* Results */}
          {code && (
            <>
              {isFetchingSearch ? (
                <Center py="xl">
                  <Stack align="center" spacing="sm">
                    <IconVideo size={48} color="#667eea" />
                    <Text color="dimmed">Mencari coaching clinic...</Text>
                  </Stack>
                </Center>
              ) : dataMentoring ? (
                <MentoringResultCard
                  data={dataMentoring}
                  isRegistered={dataMentoring?.is_join}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                  onViewDetails={handleViewDetails}
                  isLoadingRegister={isLoadingGabung}
                  isLoadingUnregister={isLoadingBatal}
                />
              ) : (
                <Paper p="xl" radius="md" withBorder>
                  <Center>
                    <Stack align="center" spacing="sm">
                      <IconSearch size={48} color="#ccc" />
                      <Text weight={500}>Tidak Ditemukan</Text>
                      <Text size="sm" color="dimmed" align="center">
                        Coaching clinic dengan kode &ldquo;{code}&rdquo; tidak
                        ditemukan. Pastikan kode yang dimasukkan sudah benar.
                      </Text>
                      <Button onClick={handleReset}>Cari Lagi</Button>
                    </Stack>
                  </Center>
                </Paper>
              )}
            </>
          )}

          {/* Empty state when no search yet */}
          {!code && (
            <Paper p="xl" radius="md" withBorder>
              <Center>
                <Stack align="center" spacing="sm">
                  <IconVideo size={48} color="#667eea" />
                  <Text weight={500}>Masukkan Kode Mentoring</Text>
                  <Text size="sm" color="dimmed" align="center">
                    Masukkan kode unik yang diberikan oleh coach untuk bergabung
                    ke sesi coaching clinic.
                  </Text>
                </Stack>
              </Center>
            </Paper>
          )}
        </Stack>
      </Modal>

      {/* Modal Daftar dengan form alasan */}
      <ModalDaftarMentoring
        open={showDaftarModal}
        onCancel={() => setShowDaftarModal(false)}
        onSubmit={gabungMentoring}
        isLoading={isLoadingGabung}
        meeting={dataMentoring}
      />
    </>
  );
};

// Main Component
function SearchCoachingClinicByCode() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ModalPencarian open={open} onCancel={() => setOpen(false)} />
      <Button
        onClick={() => setOpen(true)}
        icon={<IconSearch size={16} />}
        type="primary"
      >
        Cari dengan Kode
      </Button>
    </>
  );
}

export default SearchCoachingClinicByCode;
