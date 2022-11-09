function Solusi({ data }) {
  if (data?.status_code !== "SELESAI") {
    return null;
  } else {
    return <div>{JSON.stringify(data)}</div>;
  }
}

export default Solusi;
