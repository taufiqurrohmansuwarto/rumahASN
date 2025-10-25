import { useCheckEmailJatimprov } from "@/hooks/kominfo-submissions";

const CheckEmail = () => {
  const { data, isLoading, error } = useCheckEmailJatimprov();

  return <div>{JSON.stringify(data, null, 2)}</div>;
};

export default CheckEmail;
