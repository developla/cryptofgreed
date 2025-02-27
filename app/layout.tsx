import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Providers } from '@/components/providers';
import { GameHeader } from '@/components/layout/game-header';
import { Navigation } from '@/components/layout/navigation';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Project Gamify',
  description: 'A Web3-powered roguelike deck-building game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Navigation />
            <GameHeader />
            <div className="pt-20">{children}</div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}