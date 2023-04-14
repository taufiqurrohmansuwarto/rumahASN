const { default: AdminLayout } = require("@/components/AdminLayout");
import {Alert, Row, Col, Typography} from 'antd'
import {Stack} from '@mantine/core'

import PageContainer from "@/components/PageContainer";

const KecepatanRespons = () => {
  return (
    <PageContainer title="Kecepatan Respon">
      <Row>
      <Col md={16}>
        <Stack>
          <Alert description='Kecepatan respon adalah seberapa cepat layanan merespon permintaan. Dalam helpdesk, respon cepat penting untuk kepuasan pelanggan dan penanganan efisien.' />
      <Typography.Text>
          berisi tentang definisi, statistik, Target kecepatan respon, kiat untuk meningkatkan respon, testimoni pelanggan, Alat dan teknologi
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
