import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huayang & Partner | Wedding",
  description: "We're getting married! Join us to celebrate our love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
