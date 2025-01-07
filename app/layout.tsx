import type { Metadata } from "next";
import "@/app/globals.css";
import Session from "@/components/session";

export const metadata: Metadata = {
  title: "Project Gamify",
  description: "Project Gamify",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Session>{children}</Session>
      </body>
    </html>
  );
}
