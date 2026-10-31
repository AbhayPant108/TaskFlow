import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'TaskFlow - Project Management for Small Teams',
  description: 'Manage tasks and projects seamlessly with TaskFlow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50/50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
