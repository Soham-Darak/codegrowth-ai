import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import CodeGrowthBackdrop from "./components/CodeGrowthBackdrop";

export const metadata = {
  title: "CodeGrowth AI",
  description: "A local-first AI engineering workspace for learning, coding, and growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CodeGrowthBackdrop />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
