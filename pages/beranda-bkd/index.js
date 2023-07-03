import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Stack } from "@mantine/core";
import { Alert, Card, Col, Row, Tabs } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const BKDSpirit = () => {
  return (
    <Alert
      message="Halo, BKD!"
      showIcon
      description="Halo, Squad BKD! Setiap pertanyaan di aplikasi Rumah ASN itu kayak tantangan baru. Yuk, kita buktikan kalau kita tim yang solid dan always ready to help. Keep spirit, and let's do it"
    />
  );
};

const TabsJobs = () => {
  const router = useRouter();
  const currentRouter = router.query.tab;

  const handleChange = (key) => {
    router.push({
      pathname: "/beranda-bkd",
      query: { tab: key },
    });
  };

  const items = [
    {
      label: "Tugas Saya",
      key: "my-task",
      children: "Content of Tab Pane 1",
    },
    {
      label: "Pertanyaan Belum Dijawab",
      key: "unanswered-task",
      children: "Content of Tab Pane 2",
    },
    {
      label: "Pertanyaan Belum dikategorikan",
      key: "uncategorized-task",
      children: "Content of Tab Pane 3",
    },
    {
      label: "Semua Daftar Pertanyaan",
      key: "all-task",
      children: (
        <div>
          <p>Content of Tab Pane 2</p>
        </div>
      ),
    },
  ];

  return (
    <Tabs
      defaultActiveKey="my-task"
      activeKey={currentRouter ? currentRouter : "my-task"}
      onChange={handleChange}
      type="card"
      items={items}
    />
  );
};

const BerandaBKD = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Beranda BKD</title>
      </Head>
      <PageContainer
        title="Beranda"
        subTitle="Badan Kepegawaian Daerah Provinsi Jawa Timur"
      >
        <Row>
          <Col md={16}>
            <Card>
              <Stack>
                <BKDSpirit />
                <TabsJobs />
              </Stack>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

BerandaBKD.Auth = {
  action: "manage",
  subject: "tickets",
};

BerandaBKD.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default BerandaBKD;
