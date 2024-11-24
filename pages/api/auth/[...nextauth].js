import { createHistory } from "@/utils/utility";
import axios from "axios";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import KeycloakProvider from "next-auth/providers/keycloak";
const User = require("../../../models/users.model");
const apigateway = process.env.APIGATEWAY_URL;

const operatorId = process.env.OPERATOR_ID;
const operatorSecret = process.env.OPERATOR_SECRET;
const operatorWellknown = process.env.OPERATOR_WELLKNOWN;
const operatorScope = process.env.OPERATOR_SCOPE;

const pttpkId = process.env.PTTPK_ID;
const pttpkSecret = process.env.PTTPK_SECRET;
const pttpkWellknown = process.env.PTTPK_WELLKNOWN;
const pttpkScope = process.env.PTTPK_SCOPE;

const userId = process.env.USER_ID;
const userSecret = process.env.USER_SECRET;
const userWellknown = process.env.USER_WELLKNOWN;
const userScope = process.env.USER_SCOPE;

const masterFasilitatorId = process.env.MASTER_FASILITATOR_ID;
const masterFasilitatorSecret = process.env.MASTER_FASILITATOR_SECRET;
const masterFasilitatorWellknown = process.env.MASTER_FASILITATOR_WELLKNOWN;
const masterFasilitatorScope = process.env.MASTER_FASILITATOR_SCOPE;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleApiKey = process.env.GOOGLE_API_KEY;

const getUserBirtdahGoogle = async (accessToken) => {
  try {
    const result = await axios.get(
      `https://people.googleapis.com/v1/people/me?personFields=birthdays&key=${googleApiKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return result;
  } catch (error) {
    const data = error?.response?.data;
    const details = data?.error?.details;
    console.log("error", details);
  }
};

// automate fucking update current_role user
const setOffline = async (id) => {
  await User.query().findById(id).patch({ is_online: false });
};

const setOnline = async (id) => {
  await User.query().findById(id).patch({ is_online: true });
};

const getInformation = async (type, accessToken) => {
  try {
    if (type === "MASTER") {
      const hasil = await axios.get(`${apigateway}/master/information`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return hasil?.data;
    } else if (type === "PTTPK") {
      const hasil = await axios.get(`${apigateway}/pttpk/information`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return hasil?.data;
    }
  } catch (error) {
    console.log(error);
  }
};

const updateUser = async (id) => {
  try {
    const currentUser = await User.query().findById(id);

    const bkd = currentUser?.organization_id?.startsWith("123");
    const role = currentUser?.role;
    const currentRole = currentUser?.current_role;
    const group = currentUser?.group;

    const pttpkBkd = currentUser?.organization_id?.startsWith("134");

    const isBKDEmployee =
      bkd && role === "USER" && group === "MASTER" && currentRole !== "admin";

    const isBKDEmployeePttpk =
      pttpkBkd &&
      role === "USER" &&
      group === "PTTPK" &&
      currentRole !== "admin";

    // fasilitator
    const isFasilitatorBKD =
      bkd && (role === "FASILITATOR" || role === "ADMIN") && group === "MASTER";

    if (isBKDEmployee || isBKDEmployeePttpk) {
      await User.query().findById(id).patch({ current_role: "agent" });
      return User.query().findById(id);
    }
    if (isFasilitatorBKD) {
      await User.query().findById(id).patch({ current_role: "admin" });
      return User.query().findById(id);
    } else {
      return currentUser;
    }
  } catch (error) {
    console.log(error);
  }
};

const upsertUser = async (currentUser) => {
  try {
    const [from, currentUserId] = currentUser?.id?.split("|");

    const {
      group,
      role,
      image,
      username,
      employee_number,
      email,
      birthdate,
      organization_id,
      status_kepegawaian,
    } = currentUser;

    const data = {
      group,
      role,
      image,
      id: currentUserId || null,
      info: currentUser?.info || null,
      custom_id: currentUser?.id,
      username,
      employee_number,
      email,
      birthdate: birthdate ? new Date(birthdate) : null,
      from,
      organization_id,
      status_kepegawaian,
      last_login: new Date(),
    };

    // upsert user if on custom_id then update the data

    const result = await User.query()
      .insert(data)
      .onConflict("custom_id")
      .merge()
      .returning("*");

    await User.query()
      .increment("frekuensi_kunjungan", 1)
      .where("custom_id", currentUser?.id);

    return result;
  } catch (error) {
    console.log(error);
  }
};
export const authOptions = {
  pages: {
    signIn: "/helpdesk/signin",
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/user.gender.read https://www.googleapis.com/auth/user.birthday.read",
          prompt: "login",
        },
      },
      profile: async (profile, token) => {
        let currentUser = {
          id: profile.sub,
          username: profile.name,
          image: profile.picture,
          email: profile.email,
          role: "USER",
          group: "GOOGLE",
          employee_number: profile.employee_number || "",
          birthdate: profile.birthdate || null,
          email: profile.email || null,
          organization_id: profile.organization_id || null,
          status_kepegawaian: profile.status_kepegawaian || "UMUM",
        };

        const accessToken = token?.access_token;
        const tanggalLahir = await getUserBirtdahGoogle(accessToken);
        const currentUserDate = tanggalLahir?.data?.birthdays?.[0]?.date;

        if (currentUserDate) {
          const birthdate = `${currentUserDate?.year}-${currentUserDate?.month}-${currentUserDate?.day}`;
          currentUser = {
            ...currentUser,
            birthdate,
          };
        }

        const result = await upsertUser(currentUser);

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    }),

    {
      name: "SIMASTER",
      id: "helpdesk-user",
      type: "oauth",
      wellKnown: userWellknown,
      clientId: userId,
      clientSecret: userSecret,
      authorization: {
        params: {
          scope: userScope,
          prompt: "login",
        },
      },
      httpOptions: {
        timeout: 40000,
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile: async (profile, token) => {
        const currentUser = {
          id: profile.sub,
          username: profile.name,
          image: profile.picture,
          email: profile.email,
          role: profile?.role,
          group: profile?.group,
          employee_number: profile.employee_number || "",
          birthdate: profile.birthdate || null,
          email: profile.email || null,
          organization_id: profile.organization_id || null,
          status_kepegawaian: profile.status_kepegawaian || null,
        };

        const info = await getInformation("MASTER", token?.access_token);

        const result = await upsertUser({ ...currentUser, info });

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    },
    {
      name: "NON ASN",
      id: "helpdesk-pttpk",
      type: "oauth",
      wellKnown: pttpkWellknown,
      clientId: pttpkId,
      clientSecret: pttpkSecret,
      authorization: {
        params: {
          scope: pttpkScope,
          prompt: "login",
        },
      },
      httpOptions: {
        timeout: 40000,
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile: async (profile, token) => {
        const currentUser = {
          id: profile.sub,
          username: profile.name,
          image: profile.picture,
          email: profile.email,
          role: profile.role,
          group: profile.group,
          employee_number: profile.employee_number || "",
          birthdate: profile.birthdate || null,
          email: profile.email || null,
          organization_id: profile.organization_id || null,
          status_kepegawaian: profile.status_kepegawaian || null,
        };

        const info = await getInformation("PTTPK", token?.access_token);
        const result = await upsertUser({ ...currentUser, info });

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    },
    {
      name: "SIMASTER FASILITATOR",
      id: "helpdesk-fasilitator",
      type: "oauth",
      wellKnown: masterFasilitatorWellknown,
      clientId: masterFasilitatorId,
      clientSecret: masterFasilitatorSecret,
      authorization: {
        params: {
          scope: masterFasilitatorScope,
          prompt: "login",
        },
      },
      httpOptions: {
        timeout: 40000,
      },
      idToken: true,
      checks: ["pkce", "state"],
      profile: async (profile, token) => {
        const currentUser = {
          id: profile.sub,
          username: profile.name,
          image: profile.picture,
          email: profile.email,
          role: profile.role,
          group: profile.group,
          employee_number: profile.employee_number || "",
          birthdate: profile.birthdate || null,
          email: profile.email || null,
          organization_id: profile.organization_id || null,
          status_kepegawaian: profile.status_kepegawaian || null,
        };

        const result = await upsertUser({ ...currentUser });

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    },
    KeycloakProvider({
      clientId: process.env.PEMPROV_CLIENT_ID,
      name: "Pemprov Jatim",
      id: "sso-pemprov",
      clientSecret: process.env.PEMPROV_CLIENT_SECRET,
      issuer: process.env.PEMPROV_ISSUER,
      authorization: {
        params: {
          prompt: "login",
          scope: "openid profile email",
        },
      },
      profile: async (profile, token) => {
        let currentUser = {
          id: profile.sub,
          username: profile.name,
          image: profile.picture,
          email: profile.email,
          role: "USER",
          group: "PEMPROV",
          employee_number: profile.nip || "",
          birthdate: profile.tgl_lahir || null,
          email: profile.email || null,
          organization_id: profile.organization_id || null,
          status_kepegawaian: profile.status_kepegawaian || "UMUM",
        };

        const result = await upsertUser(currentUser);

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    }),
  ],
  events: {
    signOut: async ({ token }) => {
      const { sub } = token;
      await setOffline(sub);
    },
    signIn: async ({ user, account, isNewUser, profile }) => {
      const { id } = user;
      await setOnline(id);
      await createHistory(id, "login", "preferences");
    },
  },
  callbacks: {
    redirect: async (url, baseUrl) => {
      const urlCallback = `${url?.baseUrl}${process.env.BASE_PATH}`;
      return urlCallback;
    },
    async session({ session, token, user }) {
      session.accessToken = token.accessToken;
      session.expires = token?.expires;

      // session.scope = token.scope;
      session.user.id = token.id;
      session.user.role = token?.role;
      session.user.group = token?.group;
      session.user.employee_number = token?.employee_number;
      session.user.organization_id = token?.organization_id;
      session.user.name = token?.username;
      session.user.current_role = token?.current_role;
      session.user.status_kepegawaian = token?.status_kepegawaian;

      const check = Date.now() < new Date(token?.expires * 1000);

      if (check) {
        return session;
      }
    },
    async jwt({ token, account, isNewUser, profile, user }) {
      if (account) {
        token.accessToken = account?.access_token;
        token.expires = profile.exp;
        token.username = profile?.name;
        token.id = account?.providerAccountId;
        token.role = profile?.role || user?.role;
        token.group = profile?.group || user?.group;
        token.employee_number = profile?.employee_number;
        token.organization_id = profile?.organization_id;
        token.current_role = user?.current_role;
        token.status_kepegawaian = user?.status_kepegawaian;
      }

      return token;
    },
  },
  theme: "light",
  secret: process.env.SECRET,
  jwt: {
    secret: process.env.SECRET,
  },
};

export default NextAuth(authOptions);
