import "./globals.css";

export const metadata = {
  title: "CodeGrowth AI",
  description: "AI-assisted software engineering workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
