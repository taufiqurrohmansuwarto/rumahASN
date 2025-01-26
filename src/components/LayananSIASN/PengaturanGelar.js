import { checkGelar, getGelar, uncheckGelar } from "@/services/siasn-services";
import { SettingOutlined } from "@ant-design/icons";
import { Alert } from "@mantine/core";
import { IconInfoCircle, IconLamp } from "@tabler/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
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
  const { data, isLoading } = useQuery(["daftar-gelar"], () => getGelar(), {
    refetchOnWindowFocus: false,
  });

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

  const handleCheck = async (id, event, loc) => {
    const isChecked = event.target.checked;
    setIdGelar(id);
    const payload = {
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
      width={600}
      title="Pengaturan Gelar"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Alert my={18} color="blue" variant="light" icon={<IconInfoCircle />}>
        <Space direction="vertical">
          <Typography.Text>
            Pilih gelar yang sesuai dengan Anda.{" "}
          </Typography.Text>
          <Typography.Text>
            Gelar anda tidak sesuai?{" "}
            <a href="/helpdesk/pemutakhiran-data/pendidikan">
              Cek data Pendidikan SIASN
            </a>{" "}
            atau{" "}
            <a
              href="https://bkd.jatimprov.go.id/penyesuaiangelar"
              target="_blank"
            >
              Lihat Panduan Pencantuman Gelar.
            </a>
          </Typography.Text>
        </Space>
      </Alert>
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
      <Tag
        style={{
          cursor: "pointer",
        }}
        onClick={handleShowModal}
        icon={<SettingOutlined />}
      >
        Pengaturan Gelar
      </Tag>
    </>
  );
}

export default PengaturanGelar;
