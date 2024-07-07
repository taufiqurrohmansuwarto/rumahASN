const AsnBirthday = () => {
  return <div>hello world</div>;
};

AsnBirthday.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnBirthday.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnBirthday;
