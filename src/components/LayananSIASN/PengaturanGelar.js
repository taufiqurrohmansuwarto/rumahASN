import { checkGelar, getGelar, uncheckGelar } from "@/services/siasn-services";
import { SettingOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Checkbox,
  Col,
  message,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";

// cast 'true' to true
const castToBoolean = (value) => (value === "true" ? true : false);

const ModalPengaturanGelar = ({ open, onCancel, onOk }) => {
  const [idGelar, setIdGelar] = useState(null);
  const { data, isLoading } = useQuery(["daftar-gelar"], () => getGelar(), {});
  const queryClient = useQueryClient();

  const { mutateAsync: gelarCheck, isLoading: isLoadingGelarCheck } =
    useMutation((data) => checkGelar(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["daftar-gelar"]);
        message.success("Update gelar berhasil");
      },
      onError: () => {
        message.error("Update gelar gagal");
      },
      onSettled: () => {
        setIdGelar(null);
      },
    });

  const { mutateAsync: gelarUncheck, isLoading: isLoadingGelarUncheck } =
    useMutation((data) => uncheckGelar(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["daftar-gelar"]);
        message.success("Update gelar berhasil");
      },
      onError: () => {
        message.error("Update gelar gagal");
      },
      onSettled: () => {
        setIdGelar(null);
      },
    });

  const handleCheck = async (id, event) => {
    const isChecked = event.target.checked;
    setIdGelar(id);
    if (isChecked) {
      await gelarCheck(id);
    } else {
      await gelarUncheck(id);
    }
  };

  return (
    <Modal
      title="Pengaturan Gelar"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Alert
        message="Centang gelar yang ingin ditampilkan pada profil ASN. Jika gelar tidak berubah pada ekinerja, pergi ke menu profile kemudian lakukan sinkro"
        showIcon
        type="info"
        style={{
          marginBottom: 16,
        }}
      />
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Typography.Text>Gelar Depan</Typography.Text>
            {data?.gelar_belakang?.map((gelar) => (
              <Space key={gelar.id}>
                <Checkbox
                  disabled={idGelar === gelar.id}
                  onChange={(checked) => handleCheck(gelar.id, checked)}
                  defaultChecked={castToBoolean(gelar.checked)}
                />
                <Tag key={gelar.id}>{gelar.glr_depan}</Tag>
              </Space>
            ))}
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small">
            <Typography.Text>Gelar Belakang</Typography.Text>
            {data?.gelar_depan?.map((gelar) => (
              <Space key={gelar?.id}>
                <Checkbox
                  disabled={idGelar === gelar.id}
                  onChange={(checked) => handleCheck(gelar.id, checked)}
                  defaultChecked={castToBoolean(gelar.checked)}
                />
                <Tag key={gelar.id}>{gelar.glr_belakang}</Tag>
              </Space>
            ))}
          </Space>
        </Col>
      </Row>
    </Modal>
  );
};

function PengaturanGelar() {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <ModalPengaturanGelar
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
      <Tag onClick={handleShowModal} icon={<SettingOutlined />}>
        Pengaturan Gelar
      </Tag>
    </>
  );
}

export default PengaturanGelar;
