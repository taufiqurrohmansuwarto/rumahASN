import { GoogleOutlined, LoginOutlined } from "@ant-design/icons";
import { Blockquote } from "@mantine/core";
import { Button, Col, Divider, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";

const SignIn = ({ providers }) => {
  return (
    <>
      <Head>
        <title>BKD Helpdesk</title>
      </Head>
      <Row style={{ minHeight: "100vh" }} align="middle" justify="center">
        <Col span={8}>
          <Typography.Title>BKD Helpdesk</Typography.Title>
          <Blockquote cite="- Scoot Bellsky">
            Great customer service starts with providing the right help, to the
            right person, at the right time.
          </Blockquote>
          <Space>
            {Object?.values(providers).map((provider) => (
              <div key={provider.name}>
                <Button
                  icon={
                    provider?.id === "google" ? (
                      <GoogleOutlined />
                    ) : (
                      <LoginOutlined />
                    )
                  }
                  type="primary"
                  onClick={() => signIn(provider.id)}
                >
                  Masuk dengan {provider.name}
                </Button>
              </div>
            ))}
          </Space>
          <Divider />
          <div
            style={{
              marginBottom: 10,
            }}
          >
            <Space size="small">
              <Image
                alt="pemprov"
                src="https://siasn.bkd.jatimprov.go.id:9000/public/pemprov.png"
                width={15}
                height={20}
              />
              <Image
                alt="logobkd"
                src="https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"
                width={30}
                height={40}
              />
            </Space>
          </div>
          <Space direction="vertical" size="small">
            <span>&#169; 2023 BKD Provinsi Jawa Timur</span>
          </Space>
        </Col>
        <Col span={6}>
          <Image
            alt="Mountains"
            src="https://siasn.bkd.jatimprov.go.id:9000/public/desktop.png"
            width={550}
            height={400}
          />
        </Col>
      </Row>
    </>
  );
};

export async function getServerSideProps() {
  const providers = await getProviders();

  return {
    props: {
      providers,
    },
  };
}

export default SignIn;
