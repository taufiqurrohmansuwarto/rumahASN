import Layout from "@/components/Layout";

const MyWebinar = () => {
  return <div>Hello world</div>;
};

MyWebinar.Auth = {
  action: "manage",
  subject: "tickets",
};

MyWebinar.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default MyWebinar;
