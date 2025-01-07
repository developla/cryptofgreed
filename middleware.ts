import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;

      // Allow ADMIN access to both /admin and /dashboard routes
      if (path.startsWith("/admin")) {
        return token?.role === "ADMIN";
      }

      // Allow both ADMIN and USER access to /dashboard routes
      if (path.startsWith("/dashboard")) {
        return token?.role === "ADMIN" || token?.role === "USER";
      }

      // Default to false for all other cases
      return false;
    },
  },
});

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
