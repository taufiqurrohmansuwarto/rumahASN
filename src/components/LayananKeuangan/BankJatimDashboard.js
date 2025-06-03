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

  const goToPengajuan = () => {
    router.push("/layanan-keuangan/bank-jatim/pengajuan");
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <ModalCekStatus open={showModalStatus} onClose={handleCloseModalStatus} />
      <Space style={{ marginBottom: "24px" }}>
        <Button icon={<PlusOutlined />} type="primary" onClick={goToPengajuan}>
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
        <Col
          xs={24} // 1 kolom pada mobile
          sm={24} // 1 kolom pada tablet kecil
          md={12} // 2 kolom pada tablet
          lg={8} // 3 kolom pada desktop
          xl={8} // 3 kolom pada desktop besar
          xxl={8} // 3 kolom pada desktop sangat besar
        >
          <ProductCard
            title="KKB (Kredit Kendaraan Bermotor)"
            image="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-kkb.jpg"
            description="Solusi pembiayaan kendaraan bermotor dengan bunga kompetitif, proses cepat, dan tenor fleksibel hingga 6 tahun."
            onDetail={() =>
              router.push("/layanan-keuangan/bank-jatim/produk/kkb")
            }
          />
        </Col>

        <Col
          xs={24} // 1 kolom pada mobile
          sm={24} // 1 kolom pada tablet kecil
          md={12} // 2 kolom pada tablet
          lg={8} // 3 kolom pada desktop
          xl={8} // 3 kolom pada desktop besar
          xxl={8} // 3 kolom pada desktop sangat besar
        >
          <ProductCard
            title="KPR (Kredit Pemilikan Rumah)"
            image="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-kpr.jpg"
            description="Wujudkan impian memiliki rumah dengan kredit pemilikan rumah yang mudah, bunga bersaing, dan tenor hingga 20 tahun."
            onDetail={() =>
              router.push("/layanan-keuangan/bank-jatim/produk/kpr")
            }
          />
        </Col>

        <Col
          xs={24} // 1 kolom pada mobile
          sm={24} // 1 kolom pada tablet kecil
          md={12} // 2 kolom pada tablet
          lg={8} // 3 kolom pada desktop
          xl={8} // 3 kolom pada desktop besar
          xxl={8} // 3 kolom pada desktop sangat besar
        >
          <ProductCard
            title="Kredit Multiguna"
            image="https://siasn.bkd.jatimprov.go.id:9000/public/bankjatim-multiguna.jpg"
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
