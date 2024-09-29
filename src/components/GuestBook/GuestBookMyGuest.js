import { getMyGuest } from "@/services/guests-books.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";

function GuestBookMyGuest() {
  const { data, isLoading } = useQuery(["guest-book-my-guest"], () =>
    getMyGuest()
  );

  return <Card title="Daftar Tamu Saya">{JSON.stringify(data)}</Card>;
}

export default GuestBookMyGuest;
