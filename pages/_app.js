import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { ConfigProvider } from "antd";
import id from "antd/lib/locale/id_ID";
import ability from "../utils/ability";
import "antd/dist/antd.css";
import { AbilityContext } from "../src/context/Can";

// check user role and organization start with 123
function Auth({ children, action, subject }) {
  const { data, status } = useSession({
    required: true,
    onUnauthenticated: () => signIn(),
  });

  if (status === "loading") {
    return <div>loading..</div>;
  } else {
    if (!data?.user) return <div>Not Authorized</div>;
    const user = {
      id: data?.user?.id,
      current_role: data?.user?.current_role,
      organization: data?.user?.organization_id,
    };

    const userAbility = ability(user);
    const isAllowed = userAbility.can(action, subject);

    if (isAllowed) {
      return (
        <AbilityContext.Provider value={ability(user)}>
          {children}
        </AbilityContext.Provider>
      );
    }
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider
      session={session}
      baseUrl="/helpdesk"
      basePath="/helpdesk/api/auth"
    >
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={id}>
          <Hydrate>
            {Component.Auth ? (
              <Auth
                subject={Component?.Auth?.subject}
                action={Component?.Auth?.action}
              >
                {getLayout(<Component {...pageProps} />)}
              </Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </Hydrate>
        </ConfigProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
