import { getMyGuest } from "@/services/guests-books.services";
import { useQuery } from "@tanstack/react-query";

function GuestBookMyGuest() {
  const { data, isLoading } = useQuery(["guest-book-my-guest"], () =>
    getMyGuest()
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default GuestBookMyGuest;
