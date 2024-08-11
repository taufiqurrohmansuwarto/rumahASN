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
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Center } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Empty,
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
  currentMeetingId,
  jenisPeserta,
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
  const pesertaPercentage =
    (parseInt(pesertaSaatIni) / parseInt(maksimumPeserta)) * 100;

  const renderActionButton = () => {
    if (isRegistered) {
      return [
        <Button key="detail" onClick={onViewDetails}>
          Lihat Detail
        </Button>,
        <Button key="batal" onClick={onUnregister} danger>
          Batal Daftar
        </Button>,
      ];
    } else if (status === "upcoming" || status === "live") {
      if (isRegistered) {
        return [
          <Button key="batal" onClick={onUnregister} danger>
            Batal Daftar
          </Button>,
        ];
      } else if (pesertaSaatIni < maksimumPeserta || !isRegistered) {
        return [
          <Button key="daftar" onClick={onRegister} type="primary">
            Daftar Mentoring
          </Button>,
        ];
      } else {
        return [
          <Button key="penuh" disabled>
            Pendaftaran Penuh
          </Button>,
        ];
      }
    }
  };

  return (
    <Center>
      <Card
        actions={renderActionButton()}
        hoverable
        style={{ width: 400, height: "auto", overflow: "hidden" }}
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
          <Space>
            <TeamOutlined />{" "}
            {
              <>
                {jenisPeserta?.map((peserta) => (
                  <Tag key="peserta" color="yellow">
                    {peserta}
                  </Tag>
                ))}
              </>
            }
          </Space>

          <Tooltip title={`${pesertaSaatIni} dari ${maksimumPeserta} peserta`}>
            <Space>
              <UsergroupAddOutlined />
              <Progress percent={10} size="small" showInfo={false} />
              {pesertaSaatIni}/{maksimumPeserta}
            </Space>
          </Tooltip>
        </Space>
      </Card>
    </Center>
  );
};

const ModalPencarian = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();

  const queryClient = useQueryClient();

  const [code, setCode] = useState("");

  const {
    data: dataMentoring,
    isLoading: isLoadingDataMentoring,
    isFetching: isFetchingDataMentoring,
    refetch,
  } = useQuery(["mentoring", code], () => searchMentoringByCode(code), {
    enabled: !!code,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: gabungMentoring, isLoading: isLoadingGabungMentoring } =
    useMutation((data) => requestMeeting(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["mentoring", code]);
        message.success("Berhasil mengikuti mentoring");
      },
      onError: (error) => {
        message.error(
          `Gagal mengikuti mentoring: ${error?.response?.data?.message}`
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meetings", code]);
      },
    });

  const { mutateAsync: lepasMentoring, isLoading: isLoadingLepasMentoring } =
    useMutation((data) => cancelRequestMeeting(data), {
      onSuccess: () => {
        message.success("Berhasil membatalkan mentoring");
        queryClient.invalidateQueries(["mentoring", code]);
      },
      onError: () => {
        message.error("Gagal membatalkan mentoring");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meetings", code]);
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
      },
    });
  };

  const showDetail = (id) => {
    router.push(`/coaching-clinic/${id}/detail`);
  };

  const handleOk = async () => {
    const value = await form.validateFields();
    setCode(value.code);
    refetch();
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Cari Berdasarkan Kode Mentoring"
      confirmLoading={isFetchingDataMentoring}
      onOk={handleOk}
      okText="Cari"
    >
      <Form form={form}>
        <Form.Item name="code" label="Kode">
          <Input />
        </Form.Item>
      </Form>
      {!dataMentoring ? (
        <>
          <Empty
            description="Tidak ada mentoring dengan kode tersebut"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </>
      ) : (
        <>
          <MentoringCard
            judul={dataMentoring?.title}
            deskripsi={dataMentoring?.description}
            status={dataMentoring?.status || "upcoming"}
            tanggal={dayjs(dataMentoring?.start_date).format("DD MMMM YYYY")}
            jam={`${dataMentoring?.start_hours} - ${dataMentoring?.end_hours}`}
            jenisPeserta={dataMentoring?.participants_type}
            maksimumPeserta={dataMentoring?.max_participants}
            pesertaSaatIni={dataMentoring?.currentMeetingParticipants}
            mentor={{
              name: dataMentoring?.coach?.username,
              avatar: dataMentoring?.coach?.image,
            }}
            isRegistered={dataMentoring?.is_join}
            onRegister={() => joinMeeting(dataMentoring)}
            onUnregister={() => unregisterMeeting(dataMentoring)}
            onViewDetails={() => showDetail(dataMentoring?.current_meeting_id)}
          />
        </>
      )}
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
