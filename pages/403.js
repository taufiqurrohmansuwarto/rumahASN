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
          status="403"
          title="403"
          subTitle="Oops... Halaman tidak sesuai hak akses"
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
