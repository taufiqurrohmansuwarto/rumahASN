import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
const User = require("../../../models/users.model");

const operatorId = process.env.OPERATOR_ID;
const operatorSecret = process.env.OPERATOR_SECRET;
const operatorWellknown = process.env.OPERATOR_WELLKNOWN;
const operatorScope = process.env.OPERATOR_SCOPE;

const userId = process.env.USER_ID;
const userSecret = process.env.USER_SECRET;
const userWellknown = process.env.USER_WELLKNOWN;
const userScope = process.env.USER_SCOPE;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// automate fucking update current_role user

const updateUser = async (id) => {
  try {
    const currentUser = await User.query().findById(id);
    const bkd = currentUser?.organization_id?.startsWith("123");
    const role = currentUser?.current_role;
    const group = currentUser?.grop;

    if (bkd && role === "user" && group === "MASTER") {
      await User.query().findById(id).patch({ current_role: "agent" });
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
    } = currentUser;

    const data = {
      group,
      role,
      image,
      id: currentUserId,
      custom_id: currentUser?.id,
      username,
      employee_number,
      email,
      birthdate: new Date(birthdate),
      from,
      organization_id,
      last_login: new Date(),
    };

    const result = await User.query()
      .insert(data)
      .onConflict("custom_id")
      .merge(data)
      .returning("*");
    return result;
  } catch (error) {
    console.log(error);
  }
};

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      profile: async (profile) => {
        const currentUser = {
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
        };

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
      profile: async (profile) => {
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
        };

        const result = await upsertUser(currentUser);

        const data = { ...currentUser, current_role: result?.current_role };

        const last = await updateUser(currentUser?.id);
        const lastData = { ...data, ...last, id: last?.custom_id };
        return lastData;
      },
    },
  ],
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
        token.role = profile?.role;
        token.group = profile?.group;
        token.employee_number = profile?.employee_number;
        token.organization_id = profile?.organization_id;
        token.current_role = user?.current_role;
      }

      return token;
    },
  },
  theme: "light",
  secret: process.env.SECRET,
  jwt: {
    secret: process.env.SECRET,
  },
});
