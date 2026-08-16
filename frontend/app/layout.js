import "./globals.css";

export const metadata = {
  title: "CodeGrowth AI",
  description: "A local-first AI engineering workspace for learning, coding, and growth.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
