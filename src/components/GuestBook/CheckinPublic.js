import {
  checkInPublic,
  findByQrCodePublic,
} from "@/services/guests-books.services";
import { BarcodeOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Descriptions,
  Input,
  message,
  Modal,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const ModalScanQrCode = ({
  open,
  onCancel,
  data,
  qrCode,
  onCheckIn,
  isLoading,
}) => {
  const handleCheckIn = () => {
    const payload = {
      qrCode: qrCode,
    };
    onCheckIn(payload);
  };

  return (
    <Modal
      title="Data Kunjungan Tamu"
      okText="Check In"
      okType="primary"
      confirmLoading={isLoading}
      onOk={handleCheckIn}
      open={open}
      onCancel={onCancel}
      centered
    >
      <Descriptions layout="vertical" column={1}>
        <Descriptions.Item label="Nama">{data?.guest?.name}</Descriptions.Item>
        <Descriptions.Item label="Instansi">
          {data?.guest?.institution}
        </Descriptions.Item>
        <Descriptions.Item label="Jenis Pengunjung">
          {data?.guest?.visitor_type}
        </Descriptions.Item>
        <Descriptions.Item label="Alasan Kunjungan">
          {data?.purpose}
        </Descriptions.Item>
        <Descriptions.Item label="Tanggal Kunjungan">
          {dayjs(data?.visit_date).format("DD MMMM YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Pegawai Yang Dikunjungi">
          <Avatar.Group>
            {data?.employee_visited?.map((item) => (
              <Tooltip key={item.id} title={item.name}>
                <Avatar src={item.avatar} />
              </Tooltip>
            ))}
          </Avatar.Group>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

function CheckinPublic() {
  const [qrCode, setQrCode] = useState("");
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const { mutateAsync: find, isLoading: isLoadingFind } = useMutation(
    (data) => findByQrCodePublic(data),
    {
      onSuccess: (data) => {
        setResult(data);
        handleOpenModal();
        message.success("Kunjugan Tamu Berhasil Ditemukan");
      },

      onError: (error) => {
        Modal.error({
          title: "Error",
          content: error.response.data.message,
        });
        handleCloseModal();
        setResult(null);
      },

      onSettled: () => {
        setQrCode("");
      },
    }
  );

  const { mutateAsync: guestCheckIn, isLoading: isLoadingGuestCheckIn } =
    useMutation((data) => checkInPublic(data), {
      onSuccess: (data) => {
        queryClient.invalidateQueries(["checkin"]);
        message.success("Check In Berhasil");
        handleCloseModal();
        setResult(null);
      },

      onError: (error) => {
        Modal.error({
          title: "Error",
          content: error.response.data.message,
        });
        handleCloseModal();
        setResult(null);
      },
    });

  const handleEnter = async (e) => {
    if (e.key === "Enter") {
      const payload = {
        qrCode: qrCode,
      };

      await find(payload);
    }
  };

  return (
    <Card title="Scan Kode QR (Check In)">
      <Input
        prefix={<BarcodeOutlined />}
        loading={isLoadingFind}
        onKeyDown={handleEnter}
        value={qrCode}
        onChange={(e) => setQrCode(e.target.value)}
      />
      <ModalScanQrCode
        open={showModal}
        onCancel={handleCloseModal}
        data={result?.scheduleVisit}
        qrCode={result?.qrCode?.qr_code}
        isLoading={isLoadingGuestCheckIn}
        onCheckIn={guestCheckIn}
      />
    </Card>
  );
}

export default CheckinPublic;
