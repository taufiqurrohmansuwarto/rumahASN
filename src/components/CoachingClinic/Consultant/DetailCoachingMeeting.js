import JitsiMeeting from "@/components/VideoConference/JitsiMeeting";
import {
  addParticipant,
  detailMeeting,
  removeParticipant,
  startMeeting,
  updateMeeting,
} from "@/services/coaching-clinics.services";
import {
  DeleteOutlined,
  DragOutlined,
  EditOutlined,
  QuestionCircleTwoTone,
  UserAddOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Group, ScrollArea, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  FloatButton,
  Form,
  Input,
  List,
  Modal,
  Row,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import EditCoachingClinicModal from "./EditCoachingClinicModal";
import FormParticipants from "./FormParticipants";

import useVideoConferenceStore from "@/store/useVideoConference";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import Draggable from "react-draggable";
dayjs.locale("id");
dayjs.extend(relativeTime);

const ModalAddParticipant = ({ open, onClose }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;

  const { mutateAsync: add, isLoading: isLoadingAdd } = useMutation(
    (data) => addParticipant(data),
    {
      onSuccess: () => {
        message.success("Peserta berhasil ditambahkan");
        queryClient.invalidateQueries(["meeting", id]);
        onClose();
      },
      onError: () => {
        message.error("Gagal menambahkan peserta");
      },
    }
  );

  const handleFinish = async () => {
    const value = await form.validateFields();
    const payload = {
      meetingId: id,
      data: {
        user_id: value?.user_id,
      },
    };

    add(payload);
  };

  return (
    <Modal
      confirmLoading={isLoadingAdd}
      width={600}
      onOk={handleFinish}
      centered
      open={open}
      onCancel={onClose}
      title="Tambah Peserta Coaching Clinic"
    >
      <Form layout="vertical" form={form}>
        <FormParticipants name="user_id" />
      </Form>
    </Modal>
  );
};

const DaftarPeserta = ({ data, meeting, openDrawer, handleCancelDrawer }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = router.query;
  const [filterData, setFilterData] = useState(data);

  useEffect(() => {
    setFilterData(data);
  }, [data]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => removeParticipant(data),
    {
      onSuccess: () => {
        message.success("Peserta berhasil dihapus");
        queryClient.invalidateQueries(["meeting", id]);
      },
      onError: () => {
        message.error("Gagal menghapus peserta");
      },
    }
  );

  const handleRemove = (participant) => {
    Modal.confirm({
      title: "Hapus Peserta",
      centered: true,
      content: `Apakah anda yakin ingin menghapus peserta ${participant?.participant?.username} dari coaching clinic ini?`,
      okText: "Ya",
      onOk: async () => {
        try {
          const payload = {
            meetingId: id,
            participantId: participant?.id,
          };
          await remove(payload);
        } catch (error) {
          console.log(error);
        }
      },
      cancelText: "Tidak",
    });
  };

  return (
    <Drawer
      open={openDrawer}
      onClose={handleCancelDrawer}
      title="Daftar Peserta"
      width={600}
    >
      <Stack>
        <Group position="apart">
          <Tooltip title="Tambah Peserta">
            <Button
              shape="circle"
              onClick={handleOpen}
              type="primary"
              icon={<UserAddOutlined />}
            />
          </Tooltip>
          <Typography.Text strong>
            {data?.length} dari {meeting?.max_participants} Peserta
          </Typography.Text>
        </Group>
        <Input.Search
          allowClear
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setFilterData(data);
            } else {
              const filter = data.filter((item) => {
                const username = item?.participant?.username?.toLowerCase();
                return username.includes(value.toLowerCase());
              });
              setFilterData(filter);
            }
          }}
        />
      </Stack>
      <ScrollArea h={450}>
        <ModalAddParticipant open={open} onClose={handleClose} />
        <List
          size="small"
          dataSource={filterData}
          rowKey={(row) => row?.custom_id}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="hapus"
                  size="small"
                  onClick={() => handleRemove(item)}
                  icon={<DeleteOutlined />}
                />,
              ]}
            >
              <List.Item.Meta
                title={<Space>{item?.participant?.username}</Space>}
                description={
                  <Space direction="vertical" size="small">
                    {/* <>
                    {item?.participant?.info?.jabatan?.jabatan && (
                      <Tag color="blue">
                        {item?.participant?.info?.jabatan?.jabatan}
                      </Tag>
                    )}
                  </> */}
                    <>
                      {item?.participant?.info?.perangkat_daerah?.detail && (
                        <Typography.Text
                          style={{
                            fontSize: 12,
                          }}
                          type="secondary"
                        >
                          {item?.participant?.info?.perangkat_daerah?.detail}
                        </Typography.Text>
                      )}
                    </>
                    <Typography.Text type="secondary">
                      {dayjs(item?.created_at).format("DD MMMM YYYY HH:mm:ss")}
                    </Typography.Text>
                  </Space>
                }
                avatar={<Avatar size="small" src={item?.participant?.image} />}
              />
            </List.Item>
          )}
        />
      </ScrollArea>
    </Drawer>
  );
};

const ModalInformation = ({ open, onClose, item }) => {
  return (
    <Modal
      centered
      title="Informasi Coaching & Mentoring"
      open={open}
      onCancel={onClose}
      footer={null}
      closable={true}
    >
      <Descriptions layout="vertical" size="small">
        <Descriptions.Item label="Judul">{item?.title}</Descriptions.Item>
        <Descriptions.Item label="Deskripsi" span={2}>
          {item?.description}
        </Descriptions.Item>
        <Descriptions.Item label="Private">
          {item?.is_private ? "Privat" : "Publik"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color="blue">{item?.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal" span={3}>
          {dayjs(item?.start_date).format("DD MMMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Jam" span={3}>
          {item?.start_hours} - {item?.end_hours}
        </Descriptions.Item>
        <Descriptions.Item label="Maksimum Peserta" span={3}>
          {item?.max_participants}
        </Descriptions.Item>
        <Descriptions.Item label="Coaching">
          {item?.coach?.username}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

function FloatingVideoConference({ data, closeMeeting }) {
  const {
    isOpen,
    position,
    size,
    isMinimized,
    updatePosition,
    updateSize,
    toggleMinimize,
  } = useVideoConferenceStore();
  const [renderKey, setRenderKey] = useState(0);

  const handleDrag = (e, data) => {
    updatePosition({ x: data.x, y: data.y });
  };

  if (!isOpen) return null;

  return createPortal(
    <Draggable position={position} onStop={handleDrag} handle=".drag-handle">
      <div
        style={{
          position: "fixed",
          zIndex: 1000,
          width: size.width,
          height: size.height,
          transition: "width 0.3s, height 0.3s",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          overflow: "hidden",
          resize: isMinimized ? "none" : "both",
        }}
      >
        <div
          className="drag-handle"
          style={{
            padding: "8px",
            background: "#f0f0f0",
            cursor: "move",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <DragOutlined style={{ cursor: "move" }} />
            <Typography.Text strong>Coaching & Mentoring</Typography.Text>
          </Space>
          <Space>
            <Button size="small" onClick={toggleMinimize}>
              {isMinimized ? "Maximize" : "Minimize"}
            </Button>
            <Button size="small" onClick={closeMeeting}>
              Close
            </Button>
          </Space>
        </div>
        <div style={{ height: "calc(100% - 40px)", overflow: "hidden" }}>
          <JitsiMeeting
            key={renderKey}
            domain="coaching-online.site"
            jwt={data?.jwt}
            roomName={data?.id}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
            }}
            configOverwrite={{
              prejoinPageEnabled: false,
              startWithAudioMuted: true,
              startScreenSharing: true,
              enableEmailInStats: false,
              whiteboard: {
                enabled: true,
                collabServerBaseUrl:
                  "https://siasn.bkd.jatimprov.go.id/whiteboard",
              },
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              APP_NAME: "Coaching & Mentoring",
            }}
            userInfo={{
              displayName: data?.coach?.username,
              role: "moderator",
            }}
            onReadyToClose={() => {
              closeMeeting();
            }}
          />
        </div>
      </div>
    </Draggable>,
    document.body
  );
}

function DetailCoachingMeeting() {
  const router = useRouter();
  const { id } = router.query;

  const [renderKey, setRenderKey] = useState(0);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["meeting", id],
    () => detailMeeting(id),
    {
      enabled: !!id,
      onSuccess: () => {
        if (data?.status === "live") {
          openVideoConference();
        }
      },
    }
  );

  const { openVideoConference, closeVideoConference } =
    useVideoConferenceStore();

  const { mutateAsync: start, isLoading: isLoadingStart } = useMutation(
    (data) => startMeeting(data),
    {
      onSuccess: () => {
        message.success("Meeting started");
        queryClient.invalidateQueries(["meeting", id]);
        setRenderKey((prev) => prev + 1);
        openVideoConference();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["meeting", id]);
      },
    }
  );

  const { mutateAsync: updateData, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateMeeting(data),
    {
      onSuccess: () => {
        message.success("Coaching clinic berhasil diupdate");
        queryClient.invalidateQueries(["meeting", id]);
        queryClient.invalidateQueries(["meetings"]);
        router.push("/coaching-clinic-consultant");
      },
    }
  );

  const handleStartMeeting = () => {
    Modal.confirm({
      title: "Mulai Coaching & Mentoring",
      content: "Apakah anda yakin ingin memulai coaching & mentoring ini?",
      okText: "Ya",
      cancelText: "Tidak",
      centered: true,
      onOk: async () => {
        await start(id);
      },
    });
  };

  const closeMeeting = () => {
    Modal.info({
      title: "Coaching Clinic telah selesai",
      content:
        "Terima kasih telah menggunakan layanan coaching clinic Rumah ASN",
      okText: "Tutup",
      centered: true,
      onOk: async () => {
        await updateData({
          id,
          data: {
            status: "end",
          },
        });
        closeVideoConference();
      },
    });
  };

  const [open, setOpen] = useState(false);
  const [api, setApi] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpenDrawer = () => setOpenDrawer(true);
  const handleCancelDrawer = () => setOpenDrawer(false);

  const handleEdit = () => {
    setOpenEditModal(true);
  };

  const handleEditModalClose = () => {
    setOpenEditModal(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <FloatButton.BackTop />
      <EditCoachingClinicModal
        id={router?.query?.id}
        open={openEditModal}
        onClose={handleEditModalClose}
      />
      <Card
        extra={
          <Space>
            <QuestionCircleTwoTone
              onClick={handleOpen}
              style={{
                cursor: "pointer",
              }}
            />
            <Button type="primary" onClick={handleOpenDrawer}>
              Peserta
            </Button>
          </Space>
        }
        title={
          <Space>
            <Typography.Text>{data?.title}</Typography.Text>
            <EditOutlined
              onClick={handleEdit}
              style={{
                cursor: "pointer",
              }}
            />
          </Space>
        }
        loading={isLoading}
      >
        <ModalInformation open={open} item={data} onClose={handleClose} />
        {data?.status === "live" ? (
          <Row gutter={[16, 16]}>
            <Col md={24} xs={24}>
              <FloatingVideoConference
                data={data}
                closeMeeting={closeMeeting}
              />
            </Col>
            <Col md={6} xs={24}>
              <DaftarPeserta
                meeting={data}
                data={data?.participants}
                openDrawer={openDrawer}
                handleCancelDrawer={handleCancelDrawer}
              />
            </Col>
          </Row>
        ) : (
          <>
            <Row gutter={[32, 32]}>
              <Col md={24} xs={24}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    height: "50vh",
                    backgroundColor: "#eee",
                  }}
                >
                  <Empty
                    description={`Hmmm... sepertinya coaching clinic belum dimulai atau coaching clinic sudah berakhir`}
                  >
                    <Button
                      shape="round"
                      onClick={handleStartMeeting}
                      loading={isLoadingStart}
                      disabled={isLoading}
                      type="primary"
                      icon={<VideoCameraOutlined />}
                    >
                      Mulai
                    </Button>
                  </Empty>
                </div>
              </Col>
              <Col md={6} xs={24}>
                <DaftarPeserta
                  meeting={data}
                  data={data?.participants}
                  openDrawer={openDrawer}
                  handleCancelDrawer={handleCancelDrawer}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </>
  );
}

export default DetailCoachingMeeting;
