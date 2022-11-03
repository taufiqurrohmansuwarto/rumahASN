import { GoogleOutlined } from "@ant-design/icons";
import { Button, Space } from "antd";
import { getProviders, signIn } from "next-auth/react";
import LoginFormPage from "../src/components/LoginForm";

export default function SignIn({ providers }) {
  return (
    <div
      style={{
        backgroundColor: "white",
        height: "100vh",
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://siasn.bkd.jatimprov.go.id:9000/public/doodle-new.png"
        logo="https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"
        title="BKD Jatim"
        subTitle="Helpdesk Sistem Informasi"
        activityConfig={{
          style: {
            boxShadow: "0px 0px 8px rgba(0, 0, 0, 0.2)",
            color: "#fff",
            borderRadius: 8,
            backgroundColor: "#1677FF",
          },
          title: "Badan Kepegawaian Daerah",
          subTitle: "Provinsi Jawa Timur",

          action: (
            <Button
              size="large"
              style={{
                borderRadius: 20,
                background: "#fff",
                color: "#1677FF",
                width: 120,
              }}
            >
              Website
            </Button>
          ),
        }}
        actions={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Space direction="vertical" align="center">
              {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                  <Button
                    type="primary"
                    icon={provider?.id === "google" ? <GoogleOutlined /> : null}
                    onClick={() => signIn(provider.id)}
                  >
                    Masuk menggunakan {provider.name}
                  </Button>
                </div>
              ))}
            </Space>
          </div>
        }
        submitter={{
          render: () => null,
        }}
      ></LoginFormPage>
    </div>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: {
      providers,
    },
  };
}
