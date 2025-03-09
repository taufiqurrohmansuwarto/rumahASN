import {
  checkGelarByNip,
  getGelarByNip,
  uncheckGelarByNip,
} from "@/services/siasn-services";
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
import { useRouter } from "next/router";
import { useState } from "react";

// cast 'true' to true
const castToBoolean = (value) => (value === "true" ? true : false);

const ModalPengaturanGelar = ({ open, onCancel, onOk }) => {
  const router = useRouter();

  const nip = router?.query?.nip;

  const [idGelar, setIdGelar] = useState(null);
  const { data, isLoading } = useQuery(
    ["gelar-by-nip", nip],
    () => getGelarByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );
  const queryClient = useQueryClient();

  const { mutateAsync: gelarCheck, isLoading: isLoadingGelarCheck } =
    useMutation((data) => checkGelarByNip(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["gelar-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
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
    useMutation((data) => uncheckGelarByNip(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["gelar-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        message.success("Update gelar berhasil");
      },
      onError: () => {
        message.error("Update gelar gagal");
      },
      onSettled: () => {
        setIdGelar(null);
      },
    });

  const handleCheck = async (id, event, loc) => {
    const isChecked = event.target.checked;
    setIdGelar(id);
    const payload = {
      nip,
      gelarId: id,
      loc: loc,
    };
    if (isChecked) {
      await gelarCheck(payload);
    } else {
      await gelarUncheck(payload);
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
                  onChange={(checked) => handleCheck(gelar.id, checked, "D")}
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
                  onChange={(checked) => handleCheck(gelar.id, checked, "B")}
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

function PengaturanGelarByNip() {
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

export default PengaturanGelarByNip;
