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
    const asnBkd =
      currentUser?.organization_id?.startsWith("123") &&
      currentUser?.role === "USER";
    const pttBkd =
      currentUser?.organization_id?.startsWith("134") &&
      currentUser?.role === "USER";

    const userPns =
      currentUser?.group === "MASTER" && currentUser?.role === "USER";
    const userPttpk =
      currentUser?.group === "PTTPK" && currentUser?.role === "USER";

    const adminBKD =
      currentUser?.role === "FASILITATOR" &&
      currentUser?.current_role === "admin";

    const fasilitatorMaster =
      currentUser?.group === "MASTER" && currentUser?.role === "FASILITATOR";

    const pegawaiBKD = asnBkd || pttBkd;
    const pegawaiPemda = userPns || userPttpk;

    if (pegawaiBKD || pegawaiPemda || adminBKD) {
      router.push("/asn-connect/asn-knowledge");
    } else if (fasilitatorMaster) {
      router.push("/rekon/dashboard");
    } else {
      router.push("/feeds");
    }
  }

  return null;
}
