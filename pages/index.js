import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  const { status, data } = useSession({
    required: true,
    onUnauthenticated: () => signIn(),
  });

  if (status === "authenticated") {
    const currentUser = data?.user;

    // asn bkd adalah currentUser.organization_id yang berawalan  123
    const asnBkd = currentUser?.organization_id?.startsWith("123");
    const pttBkd = currentUser?.organization_id?.startsWith("134");

    const pegawaiBKD = asnBkd || pttBkd;

    if (pegawaiBKD) {
      router.push("/beranda-bkd");
    } else {
      router.push("/feeds");
    }
  }

  return null;
}
