import PageContainer from "@/components/PageContainer";
import { Alert, Col, Row } from "antd";

const { default: AdminLayout } = require("@/components/AdminLayout");

const KepuasanPelanggan = () => {
  return (
    <PageContainer title="Analisis Kepuasan Pelanggan">
      <Row>
        <Col md={16} xs={24}>
          <Alert description="Analisis kepuasan pelanggan adalah proses mengukur sejauh mana produk atau layanan yang diberikan oleh sebuah organisasi memenuhi atau melampaui harapan pelanggan. Tujuannya adalah untuk menilai kualitas pelayanan, mengidentifikasi area yang memerlukan perbaikan, dan mengambil langkah-langkah yang diperlukan untuk meningkatkan kepuasan pelanggan. Analisis ini melibatkan pengumpulan data melalui umpan balik pelanggan, survei, atau metrik lainnya dan kemudian menganalisis data tersebut untuk menghasilkan wawasan yang berguna." />
        </Col>
      </Row>
    </PageContainer>
  );
};

KepuasanPelanggan.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

KepuasanPelanggan.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default KepuasanPelanggan;
