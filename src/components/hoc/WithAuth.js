const { useSession } = require("next-auth/react");

const WithAuth = (Component, loginWith) => {
  return (props) => {
    const { data } = useSession();
    const check = loginWith?.includes(data?.user?.group);
    if (check) {
      return <Component {...props} />;
    } else {
      return null;
    }
  };
};

WithAuth.displayName = "WithAuth";

export default WithAuth;
