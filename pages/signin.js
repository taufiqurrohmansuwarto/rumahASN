import BezzetingFungsional from "@/components/Bezzeting/BezzetingFungsional";
import Features from "@/components/Features";
import Footer from "@/components/Outer/Footer";
import TombolLoginSimaster from "@/components/TombolLogin/TombolLoginSimaster";
import UserRating from "@/components/UserRating";
import { Center } from "@mantine/core";
import { useSpring } from "@react-spring/web";
import { Col, Divider, FloatButton, Grid, Row, Space, Typography } from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
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
      src={"https://siasn.bkd.jatimprov.go.id:9000/public/signin_ba.png"}
      width={350}
      height={400}
    />
  );
};

const SignIn = ({ providers }) => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  const gotoNetralitas = () => {
    router.push("/netralitas");
  };

  const loginWithGoogle = (e) => {
    e?.preventDefault();
    signIn("google");
  };

  const title = "Rumah ASN: Sobat Kepegawaian #1 di Jatim";
  const description =
    "Dengerin nih, brosis! Rumah ASN tuh jawabannya buat semua pertanyaan seru seputar dunia kepegawaian di Jawa Timur. Mulai dari info terkini, diskusi hangat, sampe ngobrol santai via podcast, semuanya ada di sini. Kita juga punya fitur unik buat catat segala aktivitas dan data kamu, biar kamu makin mantap jadi ASN yang oke. So, yuk gabung dan rasain serunya jadi bagian dari Rumah ASN!";
  return (
    <>
      <Head>
        <title>
          Rumah ASN by BKD Provinsi Jawa Timur - Kolaborasi Cerdas, Pelayanan
          Tuntas
        </title>
        <meta name="description" content="Rumah ASN" />
      </Head>
      <Row justify="center" style={{ marginBottom: 100 }}>
        <Col md={12} xxl={6} lg={8} xs={24} sm={24}>
          {/* <BAComponent /> */}
        </Col>
        <Col md={12} xxl={5} lg={10} xs={24} sm={24}>
          <Row
            style={{
              paddingLeft: breakPoint.xs ? 16 : null,
              paddingRight: breakPoint.xs ? 16 : null,
            }}
          >
            <Col md={24} xs={24}>
              <Center>
                <Space align="center" style={{ marginTop: 32 }}>
                  <span style={{ marginTop: 12 }}>
                    <Typography.Title
                      style={{ margin: 0, fontWeight: "bold" }}
                      level={1}
                    >
                      RUMAH ASN
                    </Typography.Title>
                    <Typography.Text style={{ margin: 0 }}>
                      &quot;Kolaborasi Cerdas Pelayanan Tuntas&quot;
                    </Typography.Text>
                  </span>
                </Space>
              </Center>
              <Divider plain>Anda masyarakat umum?</Divider>
              <GoogleButton
                label="Masuk dengan Google"
                onClick={loginWithGoogle}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24}>
              <Divider plain>
                atau anda pegawai Pemerintah Provinsi Jawa Timur?
              </Divider>
            </Col>
            <Col xs={24}>
              <Row gutter={[16, 10]}>
                {Object?.values(providers).map((provider) => (
                  <Col xs={24} md={24} key={provider.id}>
                    {provider?.id !== "google" && (
                      <TombolLoginSimaster
                        size="large"
                        onClick={(e) => {
                          e?.preventDefault();
                          signIn(provider.id);
                        }}
                        text={`Masuk dengan akun ${provider.name}`}
                      />
                    )}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      <Features title={title} description={description} />
      <UserRating />
      <BezzetingFungsional />
      <Footer />
      <FloatButton.BackTop />
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
