const { default: AdminLayout } = require("@/components/AdminLayout");
import { Alert, Row, Col, Typography } from "antd";
import { Stack } from "@mantine/core";

import PageContainer from "@/components/PageContainer";

const KecepatanRespons = () => {
  return (
    <PageContainer title="Analisis Kecepatan Respon">
      <Row>
        <Col md={16}>
          <Stack>
            <Alert description="Analisis kecepatan respon adalah proses mengukur seberapa cepat organisasi atau individu merespon permintaan pelanggan, seperti pertanyaan, keluhan, atau masalah yang diajukan melalui layanan helpdesk atau dukungan pelanggan. Tujuannya adalah untuk menilai kinerja dalam memberikan dukungan kepada pelanggan, mengidentifikasi area yang memerlukan perbaikan, dan mengambil langkah-langkah yang diperlukan untuk meningkatkan kecepatan respon." />
            <Typography.Text>
              berisi tentang definisi, statistik, Target kecepatan respon, kiat
              untuk meningkatkan respon, testimoni pelanggan, Alat dan teknologi
            </Typography.Text>
          </Stack>
        </Col>
      </Row>
    </PageContainer>
  );
};

KecepatanRespons.getLayout = function getLayout(page) {
  return <AdminLayout active="/admin/analisis">{page}</AdminLayout>;
};

KecepatanRespons.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default KecepatanRespons;
