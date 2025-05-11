// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",  // 세션을 JWT로 처리
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
