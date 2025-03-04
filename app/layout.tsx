import '@/styles/app.css';
import '@/styles/index.css';
import Layout from '@/components/Layout';

export const metadata = {
  title: 'Crypt of Greed',
  description: 'A Web3-powered roguelike deck-building game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
