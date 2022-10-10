import dynamic from "next/dynamic";
import { useState } from "react";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

const Editor = dynamic(() => import("../../src/components/Editor"), {
  ssr: false,
});

const CreateTicket = () => {
  const [value, setValue] = useState();

  const onChange = (value) => {
    setValue(value);
  };

  return (
    <PageContainer>
      <h1>Create Ticket</h1>
      <Editor onChange={onChange} />
    </PageContainer>
  );
};

CreateTicket.getLayout = function getLayout(page) {
  return <Layout active="/tickets">{page}</Layout>;
};

CreateTicket.Auth = {
  action: "create",
  subject: "Tickets",
};

export default CreateTicket;
