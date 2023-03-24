import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Divider, Row, Col, Card } from "antd";

const SavedReplies = () => {
  return (
    <PageContainer
      title="Balasan Tersimpan"
      content="Balasan yang disimpan adalah potongan teks yang dapat digunakan kembali yang dapat Anda gunakan di seluruh bidang komentar Helpdesk. Balasan yang disimpan dapat menghemat waktu Anda jika Anda sering mengetik tanggapan yang serupa."
    >
      <Row justify="center">
        <Col span={14}>
          <Card>
            <ListSavedReplies />
            <Divider orientation="left">Tambahkan Balasan Tersimpan</Divider>
            <CreateSavedReplies />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

SavedReplies.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

SavedReplies.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SavedReplies;
