import { GoogleOutlined, LoginOutlined } from "@ant-design/icons";
import { Blockquote } from "@mantine/core";
import { Button, Col, Divider, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import GoogleButton from "react-google-button";

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
          <GoogleButton
            label="Masuk dengan Google"
            onClick={() => signIn("google")}
          />
          <Divider plain>atau punya akun Pegawai Provinsi Jawa Timur?</Divider>
          <Space wrap>
            {Object?.values(providers).map((provider) => (
              <div key={provider.id}>
                {provider?.id !== "google" && (
                  <Button
                    icon={<LoginOutlined />}
                    type="primary"
                    onClick={() => signIn(provider.id)}
                  >
                    Masuk dengan akun {provider.name}
                  </Button>
                )}
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
            <Typography.Text type="secondary">
              &#169; 2023 BKD Provinsi Jawa Timur
            </Typography.Text>
          </Space>
        </Col>
        <Col span={6}>
          <Image
            alt="Mountains"
            src="https://siasn.bkd.jatimprov.go.id:9000/public/helpdesk-title.png"
            width={550}
            height={600}
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
