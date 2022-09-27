import { Button, Input } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import Layout from "../src/components/Layout";
import PageContainer from "../src/components/PageContainer";

export default function Home() {
  const handleSignin = () => {
    signIn("user");
  };

  const { data } = useSession();

  return (
    <Layout>
      <PageContainer title="Hello world" subTitle="tes">
        <Input />
        {JSON.stringify(data)}
        <Button onClick={handleSignin}>Hello</Button>
        <Button onClick={signOut}>Logout</Button>
      </PageContainer>
    </Layout>
  );
}
