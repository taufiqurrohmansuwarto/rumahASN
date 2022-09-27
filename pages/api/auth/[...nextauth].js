import NextAuth from "next-auth/next";
const User = require("../../../models/users.model");

const operatorId = process.env.OPERATOR_ID;
const operatorSecret = process.env.OPERATOR_SECRET;
const operatorWellknown = process.env.OPERATOR_WELLKNOWN;
const operatorScope = process.env.OPERATOR_SCOPE;

const userId = process.env.USER_ID;
const userSecret = process.env.USER_SECRET;
const userWellknown = process.env.USER_WELLKNOWN;
const userScope = process.env.USER_SCOPE;

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
      custom_id: currentUserId,
      username,
      employee_number,
      email,
      birthdate: new Date(birthdate),
      from,
      organization_id,
      last_login: new Date(),
    };

    await User.query()
      .insert(data)
      .onConflict("custom_id")
      .merge(data)
      .returning("*");
  } catch (error) {
    console.log(error);
  }
};

export default NextAuth({
  providers: [
    {
      name: "user",
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

        await upsertUser(currentUser);
        return currentUser;
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

      const check = Date.now() < new Date(token?.expires * 1000);

      if (check) {
        return session;
      }
    },
    async jwt({ token, account, isNewUser, profile, user }) {
      if (account) {
        token.accessToken = account?.access_token;

        token.expires = profile.exp;
        token.id = account?.providerAccountId;
        token.role = profile?.role;
        token.group = profile?.group;
        token.employee_number = profile?.employee_number;
        token.organization_id = profile?.organization_id;
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
