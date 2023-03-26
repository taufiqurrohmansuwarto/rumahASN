import { Button, Col, Result, Row } from "antd";
import { useRouter } from "next/router";

function NotFoundContent() {
  const router = useRouter();

  const handleBackHome = () => {
    router.push("/");
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: "100vh" }}>
      <Col span={24}>
        <Result
          status="404"
          title="404"
          subTitle="Oops... Halaman yang kamu cari tidak ditemukan"
          extra={[
            <Button onClick={handleBackHome} key="backtohome" type="primary">
              Kembali ke Beranda
            </Button>,
          ]}
        />
      </Col>
    </Row>
  );
}

export default NotFoundContent;
