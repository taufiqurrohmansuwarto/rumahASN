import AppRating from "@/components/Outer/AppRating";
import Footer from "@/components/Outer/Footer";
import {
  GlobalOutlined,
  InstagramOutlined,
  LoginOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import { Paper } from "@mantine/core";
import { useSpring } from "@react-spring/web";
import { Button, Col, Divider, Image, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import GoogleButton from "react-google-button";

const BAComponent = () => {
  const [props, api] = useSpring(
    () => ({
      from: {
        opacity: 0,
      },
      to: {
        opacity: 1,
      },
      delay: 500,
    }),
    []
  );

  return (
    <Image
      alt="Rumah ASN Brand Ambassador"
      src="https://siasn.bkd.jatimprov.go.id:9000/public/ba-new.png"
      width={400}
    />
  );
};

const SignIn = ({ providers }) => {
  return (
    <>
      <Head>
        <title>
          Rumah ASN by BKD Provinsi Jawa Timur - Ruang Menjawab Keluhan ASN Jawa
          Timur dan Masyarakat UMUM
        </title>
        <meta name="description" content="Rumah ASN" />
      </Head>
      <Row
        style={{
          minHeight: "100vh",
          padding: 16,
          backgroundImage:
            "url('https://siasn.bkd.jatimprov.go.id:9000/public/bg-buble.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
        align="middle"
        justify="center"
      >
        <Col
          md={5}
          style={{
            backgroundColor: "white",
          }}
          xs={24}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <BAComponent />
          </div>
        </Col>
        <Col
          style={{
            backgroundColor: "white",
            padding: 7,
          }}
          md={5}
          xs={24}
        >
          <Typography.Title
            style={{
              marginBottom: 0,
              fontWeight: "bold",
            }}
            level={1}
          >
            RUMAH ASN
          </Typography.Title>
          <Typography.Text
            type="secondary"
            level={5}
            style={{
              margin: 0,
              fontSize: 16,
            }}
          >
            Ruang Menjawab Keluhan ASN
          </Typography.Text>
          <Row>
            <Col md={24} xs={24}>
              <Divider plain>Anda masyarakat umum?</Divider>
              <GoogleButton
                style={{ width: "100%" }}
                label="Masuk dengan Google"
                onClick={(e) => {
                  e.preventDefault();
                  signIn("google");
                }}
              />
            </Col>
            <Col xs={24}>
              <Divider plain>
                atau anda pegawai Pemerintah Provinsi Jawa Timur?
              </Divider>
            </Col>
            <Col xs={24}>
              <Row gutter={[4, 8]}>
                {Object?.values(providers).map((provider) => (
                  <Col xs={24} md={24} key={provider.id}>
                    {provider?.id !== "google" && (
                      <Button
                        icon={<LoginOutlined />}
                        type="primary"
                        onClick={(e) => {
                          e?.preventDefault();
                          signIn(provider.id);
                        }}
                        block
                      >
                        Masuk dengan akun {provider.name}
                      </Button>
                    )}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row justify="center">
            <Space size="large">
              <GlobalOutlined
                style={{
                  fontSize: 32,
                  color: "#d9d9d9",
                  cursor: "pointer",
                }}
              />
              <InstagramOutlined
                style={{
                  fontSize: 32,
                  color: "#d9d9d9",
                  cursor: "pointer",
                }}
              />
              <YoutubeOutlined
                style={{
                  fontSize: 32,
                  color: "#d9d9d9",
                  cursor: "pointer",
                }}
              />
            </Space>
          </Row>
        </Col>
      </Row>
      <AppRating />
      <Footer />
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
