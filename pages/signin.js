import BezzetingFungsional from "@/components/Bezzeting/BezzetingFungsional";
import Features from "@/components/Features";
import Footer from "@/components/Outer/Footer";
import UserRating from "@/components/UserRating";
import { GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { useSpring } from "@react-spring/web";
import {
  Button,
  Card,
  Col,
  Flex,
  FloatButton,
  Grid,
  Row,
  Space,
  Typography,
} from "antd";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

const { Title, Text } = Typography;

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

      {/* Main Container with Card Background */}
      <div
        style={{
          minHeight: "100vh",
          padding: breakPoint.xs ? "8px" : "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background Card Container */}
        <div
          style={{
            width: "100%",
            height: breakPoint.xs ? "calc(100vh - 16px)" : "calc(100vh - 24px)",
            maxWidth: breakPoint.xs
              ? "calc(100vw - 16px)"
              : "calc(100vw - 24px)",
            position: "relative",
            overflow: "hidden",
            borderRadius: breakPoint.xs ? "20px" : "32px",
            boxShadow: "0 25px 30px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Background Image */}
          <Image
            src="https://siasn.bkd.jatimprov.go.id:9000/public/rasn-signin-page.png"
            alt="RASN Signin Background"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
            priority
            quality={100}
          />

          {/* Lighter Overlay for text readability */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Hero Text - Left Side */}
          <div
            style={{
              position: "absolute",
              top: breakPoint.xs ? "10%" : "50%",
              left: breakPoint.xs ? "20px" : breakPoint.md ? "60px" : "24px",
              transform: breakPoint.xs ? "none" : "translateY(-50%)",
              width: breakPoint.xs
                ? "calc(100% - 40px)"
                : breakPoint.md
                ? "500px"
                : "calc(100% - 48px)",
              maxWidth: breakPoint.xs ? "none" : "500px",
              zIndex: 10,
              textAlign: breakPoint.xs ? "center" : "left",
            }}
          >
            <Title
              level={1}
              style={{
                color: "white",
                fontSize: breakPoint.xs
                  ? "32px"
                  : breakPoint.xl
                  ? "64px"
                  : breakPoint.md
                  ? "52px"
                  : "40px",
                fontWeight: 700,
                lineHeight: "1.1",
                // textShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
                marginBottom: breakPoint.xs ? "12px" : "16px",
                letterSpacing: "-1px",
              }}
            >
              Urusan Kepegawaian Lebih Mudah
            </Title>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.95)",
                fontSize: breakPoint.xs ? "16px" : "18px",
                fontWeight: 400,
                // textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
                display: "block",
                lineHeight: "1.6",
                maxWidth: breakPoint.xs ? "none" : "400px",
              }}
            >
              Akses layanan kepegawaian Provinsi Jawa Timur dengan mudah, cepat,
              dan terpercaya
            </Text>
          </div>

          {/* Login Form - Positioned responsively */}
          <div
            style={{
              position: "absolute",
              top: breakPoint.xs ? "auto" : "50%",
              bottom: breakPoint.xs ? "20px" : "auto",
              right: breakPoint.xs ? "20px" : breakPoint.md ? "60px" : "24px",
              left: breakPoint.xs ? "20px" : "auto",
              transform: breakPoint.xs ? "none" : "translateY(-50%)",
              width: breakPoint.xs
                ? "auto"
                : breakPoint.md
                ? "400px"
                : "calc(100% - 48px)",
              maxWidth: breakPoint.xs ? "none" : "400px",
              zIndex: 10,
            }}
          >
            <Card
              style={{
                borderRadius: breakPoint.xs ? "16px" : "24px",
                border: "none",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
              }}
              bodyStyle={{ padding: breakPoint.xs ? "24px 20px" : "40px 32px" }}
            >
              {/* Header Section */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: breakPoint.xs ? "24px" : "32px",
                }}
              >
                <Space
                  direction="vertical"
                  size={breakPoint.xs ? 12 : 16}
                  align="center"
                >
                  <div
                    style={{
                      width: breakPoint.xs ? "56px" : "64px",
                      height: breakPoint.xs ? "56px" : "64px",
                      borderRadius: breakPoint.xs ? "14px" : "16px",
                      backgroundColor: "#EA580C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <UserOutlined
                      style={{
                        color: "white",
                        fontSize: breakPoint.xs ? "24px" : "28px",
                      }}
                    />
                  </div>
                  <div>
                    <Title
                      level={3}
                      style={{
                        margin: 0,
                        color: "#1F2937",
                        fontWeight: 700,
                        fontSize: breakPoint.xs ? "22px" : "26px",
                        letterSpacing: "-0.4px",
                      }}
                    >
                      RUMAH ASN
                    </Title>
                    <Text
                      style={{
                        color: "#6B7280",
                        fontSize: breakPoint.xs ? "13px" : "14px",
                        fontWeight: 500,
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      Kolaborasi Cerdas, Pelayanan Tuntas
                    </Text>
                  </div>
                </Space>
              </div>

              {/* Login Options */}
              <Space
                direction="vertical"
                size={breakPoint.xs ? 16 : 20}
                style={{ width: "100%" }}
              >
                {/* Public Login Section */}
                <div>
                  <Flex
                    align="center"
                    gap={12}
                    style={{ marginBottom: "12px" }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "#FEF3C7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <GoogleOutlined
                        style={{ color: "#D97706", fontSize: "14px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#374151",
                        fontSize: breakPoint.xs ? "14px" : "15px",
                      }}
                    >
                      Untuk Masyarakat Umum
                    </Text>
                  </Flex>

                  <Button
                    type="primary"
                    size="large"
                    onClick={loginWithGoogle}
                    style={{
                      width: "100%",
                      height: breakPoint.xs ? "48px" : "44px",
                      borderRadius: "12px",
                      backgroundColor: "#EA580C",
                      borderColor: "#EA580C",
                      fontWeight: 500,
                      fontSize: breakPoint.xs ? "16px" : "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)",
                    }}
                    icon={<GoogleOutlined />}
                  >
                    Masuk dengan Google
                  </Button>
                </div>

                {/* Divider */}
                <div
                  style={{
                    position: "relative",
                    textAlign: "center",
                    margin: "8px 0",
                  }}
                >
                  <div
                    style={{
                      height: "1px",
                      backgroundColor: "#E5E7EB",
                      width: "100%",
                    }}
                  />
                  <Text
                    style={{
                      position: "absolute",
                      top: "-10px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "rgba(255, 255, 255, 0.98)",
                      padding: "0 12px",
                      color: "#9CA3AF",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    atau
                  </Text>
                </div>

                {/* Employee Login Section */}
                <div>
                  <Flex
                    align="center"
                    gap={12}
                    style={{ marginBottom: "12px" }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "6px",
                        backgroundColor: "#FEF3C7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <UserOutlined
                        style={{ color: "#D97706", fontSize: "14px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#374151",
                        fontSize: breakPoint.xs ? "14px" : "15px",
                      }}
                    >
                      Pegawai Pemprov Jatim
                    </Text>
                  </Flex>

                  <Space
                    direction="vertical"
                    size={breakPoint.xs ? 8 : 10}
                    style={{ width: "100%" }}
                  >
                    {Object?.values(providers).map((provider) => (
                      <div key={provider.id}>
                        {provider?.id !== "google" && (
                          <Button
                            size="large"
                            onClick={(e) => {
                              e?.preventDefault();
                              signIn(provider.id);
                            }}
                            style={{
                              width: "100%",
                              height: breakPoint.xs ? "48px" : "44px",
                              borderRadius: "12px",
                              border: "1px solid #E5E7EB",
                              backgroundColor: "white",
                              color: "#374151",
                              fontWeight: 500,
                              fontSize: breakPoint.xs ? "16px" : "15px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#FFF7ED";
                              e.currentTarget.style.borderColor = "#EA580C";
                              e.currentTarget.style.transform =
                                "translateY(-1px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(234, 88, 12, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white";
                              e.currentTarget.style.borderColor = "#E5E7EB";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            Masuk dengan akun {provider.name}
                          </Button>
                        )}
                      </div>
                    ))}
                  </Space>
                </div>
              </Space>

              {/* Footer Text */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: breakPoint.xs ? "20px" : "24px",
                }}
              >
                <Text
                  type="secondary"
                  style={{
                    fontSize: breakPoint.xs ? "11px" : "12px",
                    color: "#9CA3AF",
                    lineHeight: "16px",
                  }}
                >
                  Dengan masuk, Anda menyetujui syarat dan ketentuan yang
                  berlaku
                </Text>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Additional Sections */}
      <div>
        <Features title={title} description={description} />
        <UserRating />
        <BezzetingFungsional />
        <Footer />
      </div>

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
