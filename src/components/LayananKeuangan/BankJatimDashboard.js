import { Button, Col, Row, Space, Modal } from "antd";
import { SearchOutlined, PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import ProductCard from "./ProductCard";
import { useState } from "react";
import CekStatusPengajuan from "./CekStatusPengajuan";

const ModalCekStatus = ({ open, onClose }) => {
  return (
    <Modal
      title="Cek Status Pengajuan"
      open={open}
      width={600}
      onCancel={onClose}
      footer={null}
    >
      <CekStatusPengajuan onSubmit={() => {}} isLoading={false} />
    </Modal>
  );
};

function BankJatimDashboard() {
  const router = useRouter();
  const [showModalStatus, setShowModalStatus] = useState(false);

  const handleShowModalStatus = () => {
    setShowModalStatus(true);
  };

  const handleCloseModalStatus = () => {
    setShowModalStatus(false);
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <ModalCekStatus open={showModalStatus} onClose={handleCloseModalStatus} />
      <Space style={{ marginBottom: "24px" }}>
        <Button icon={<PlusOutlined />} type="primary">
          Pengajuan Baru
        </Button>

        <Button
          icon={<SearchOutlined />}
          type="primary"
          onClick={handleShowModalStatus}
        >
          Cek Status Pengajuan
        </Button>
      </Space>
      <Row gutter={[24, 24]}>
        <Col span={8}>
          <ProductCard
            title="KKB (Kredit Kendaraan Bermotor)"
            image="/images/products/kkb-car.jpg"
            description="Solusi pembiayaan kendaraan bermotor dengan bunga kompetitif, proses cepat, dan tenor fleksibel hingga 6 tahun."
            onDetail={() =>
              router.push("/layanan-keuangan/bank-jatim/produk/kkb")
            }
          />
        </Col>

        <Col span={8}>
          <ProductCard
            title="KPR (Kredit Pemilikan Rumah)"
            image="/images/products/kpr-house.jpg"
            description="Wujudkan impian memiliki rumah dengan kredit pemilikan rumah yang mudah, bunga bersaing, dan tenor hingga 20 tahun."
            onDetail={() =>
              router.push("/layanan-keuangan/bank-jatim/produk/kpr")
            }
          />
        </Col>

        <Col span={8}>
          <ProductCard
            title="Kredit Multiguna"
            image="/images/products/multiguna-money.jpg"
            description="Dana tunai siap pakai untuk berbagai kebutuhan dengan plafon hingga 500 juta dan proses persetujuan yang cepat."
            onDetail={() =>
              router.push("/layanan-keuangan/bank-jatim/produk/multiguna")
            }
          />
        </Col>
      </Row>
    </div>
  );
}

export default BankJatimDashboard;
