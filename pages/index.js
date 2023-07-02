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
    const asnBKD = currentUser?.organization_id === "123";
    const pttBKD = currentUser?.organization_id === "134";

    const pegawaiBKD = asnBKD || pttBKD;

    if (pegawaiBKD) {
      router.push("/beranda-bkd");
    } else {
      router.push("/feeds");
    }
  }

  return null;
}
