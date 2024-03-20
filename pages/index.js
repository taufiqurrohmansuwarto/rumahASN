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

    const userPns =
      currentUser?.group === "MASTER" && currentUser?.role === "USER";
    const userPttpk =
      currentUser?.group === "PTTPK" && currentUser?.role === "USER";

    const pegawaiBKD = asnBkd || pttBkd;
    const pegawaiPemda = userPns || userPttpk;

    if (pegawaiBKD) {
      router.push("/beranda-bkd?tab=my-task");
    } else if (pegawaiPemda) {
      router.push("/asn-connect/asn-updates");
    } else {
      router.push("/feeds");
    }
  }

  return null;
}
