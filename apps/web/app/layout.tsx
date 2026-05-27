import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Datamak NexCart",
  description: "E-commerce prototype for Software Testing and Reliability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <NavBar />
        <main style={{ padding: 0, maxWidth: '100%' }}>{children}</main>
      </body>
    </html>
  );
}
