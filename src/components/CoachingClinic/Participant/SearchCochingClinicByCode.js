import {
  cancelRequestMeeting,
  requestMeeting,
  searchMentoringByCode,
} from "@/services/coaching-clinics.services";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Center, Stack } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const { Title, Paragraph } = Typography;

const getStatusColor = (status) => {
  switch (status) {
    case "end":
      return "red";
    case "upcoming":
      return "blue";
    case "live":
      return "green";
    default:
      return "default";
  }
};

const MentoringCard = ({
  judul,
  deskripsi,
  status,
  tanggal,
  jam,
  maksimumPeserta,
  pesertaSaatIni,
  mentor,
  isRegistered,
  onRegister,
  onUnregister,
  onViewDetails,
}) => {
  const statusColor = getStatusColor(status);
  const pesertaPercentage = (pesertaSaatIni / maksimumPeserta) * 100;

  const renderActionButton = () => {
    if (isRegistered) {
      return (
        <Stack>
          <Button onClick={onViewDetails} block>
            Lihat Detail
          </Button>
          <Button onClick={onUnregister} danger block>
            Batal Daftar
          </Button>
        </Stack>
      );
    } else if (status === "upcoming" || status === "live") {
      if (isRegistered) {
        return (
          <Button onClick={onUnregister} danger block>
            Batal Daftar
          </Button>
        );
      } else if (pesertaSaatIni < maksimumPeserta || !isRegistered) {
        return (
          <Button onClick={onRegister} type="primary" block>
            Daftar
          </Button>
        );
      } else {
        return (
          <Button disabled block>
            Pendaftaran Penuh
          </Button>
        );
      }
    }
  };

  return (
    <Center>
      <Card
        hoverable
        style={{ width: 400, height: 450, overflow: "hidden" }}
        cover={
          <div
            style={{
              height: 150,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Avatar
              size={64}
              icon={<UserOutlined />}
              src={mentor?.avatar}
              style={{
                position: "absolute",
                top: 8,
                border: "4px solid white",
              }}
            />
            <Title
              level={3}
              style={{
                color: "white",
                margin: "40px 0 0 0",
                textAlign: "center",
              }}
            >
              {judul}
            </Title>
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
              {mentor?.name}
            </Paragraph>
          </div>
        }
      >
        <Tag
          color={statusColor}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          {status.toUpperCase()}
        </Tag>
        <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "more" }}>
          {deskripsi}
        </Paragraph>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space>
            <CalendarOutlined /> {tanggal}
          </Space>
          <Space>
            <ClockCircleOutlined /> {jam}
          </Space>
          <Tooltip title={`${pesertaSaatIni} dari ${maksimumPeserta} peserta`}>
            <Space>
              <TeamOutlined />
              <Progress
                percent={pesertaPercentage}
                size="small"
                showInfo={false}
              />
              {pesertaSaatIni}/{maksimumPeserta}
            </Space>
          </Tooltip>
        </Space>
        <div style={{ marginTop: 16 }}>{renderActionButton()}</div>
      </Card>
    </Center>
  );
};

const ModalPencarian = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  const { mutateAsync: gabungMentoring, isLoading: isLoadingGabungMentoring } =
    useMutation((data) => requestMeeting(data), {
      onSuccess: () => {
        message.success("Berhasil mengikuti mentoring");
        onCancel();
      },
      onError: () => {
        message.error("Gagal mengikuti mentoring");
      },
    });

  const { mutateAsync: lepasMentoring, isLoading: isLoadingLepasMentoring } =
    useMutation((data) => cancelRequestMeeting(data), {
      onSuccess: () => {
        message.success("Berhasil membatalkan mentoring");
        onCancel();
      },
      onError: () => {
        message.error("Gagal membatalkan mentoring");
      },
    });

  const joinMeeting = (data) => {
    Modal.confirm({
      title: "Ikuti mentoring",
      content: "Apakah anda yakin ingin mengikuti mentoring ini?",
      onOk: async () => {
        await gabungMentoring(data?.id);
      },
    });
  };

  const unregisterMeeting = (data) => {
    Modal.confirm({
      title: "Batal Daftar",
      content: "Apakah anda yakin ingin membatalkan mentoring ini?",
      onOk: async () => {
        await lepasMentoring(data?.id);
        // await gabungMentoring(data?.id);
      },
    });
  };

  const showDetail = (data) => {
    router.push(`/coaching-clinic/${data?.id}/detail`);
  };

  const showModalError = () => {
    Modal.error({
      title: "Data tidak ditemukan",
      content: "Tidak ada mentoring dengan kode tersebut",
    });
  };

  const showModalSuccess = (data) => {
    Modal.success({
      title: "Data mentoring ditemukan",
      width: 600,
      closable: true,
      onCancel: onCancel,
      footer: null,
      centered: true,
      content: (
        <MentoringCard
          judul={data?.title}
          deskripsi={data?.description}
          status={data?.status}
          tanggal={dayjs(data?.start_date).format("DD MMMM YYYY")}
          jam={`${data?.start_hours} - ${data?.end_hours}`}
          maksimumPeserta={data?.max_participants}
          pesertaSaatIni={data?.currentMeetingParticipants}
          mentor={{
            name: data?.coach?.username,
            avatar: data?.coach?.image,
          }}
          isRegistered={data?.is_join}
          onRegister={() => joinMeeting(data)}
          onUnregister={() => unregisterMeeting(data)}
          onViewDetails={() => showDetail(data)}
        />
      ),
    });
  };

  const { mutate: searchByCode, isLoading } = useMutation(
    (code) => searchMentoringByCode(code),
    {
      onSuccess: (data) => {
        onCancel();
        if (!data) {
          showModalError();
        } else {
          showModalSuccess(data);
        }
      },
    }
  );

  const handleOk = async () => {
    const value = await form.validateFields();
    searchByCode(value.code);
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Cari Berdasarkan Kode Mentoring"
      confirmLoading={isLoading}
      onOk={handleOk}
    >
      <Form form={form}>
        <Form.Item name="code" label="Kode">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function SearchCochingClinicByCode() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalPencarian open={open} onCancel={handleClose} />
      <Button onClick={handleOpen} icon={<SearchOutlined />} type="primary">
        Cari Berdasarkan Code Mentoring
      </Button>
    </>
  );
}

export default SearchCochingClinicByCode;
