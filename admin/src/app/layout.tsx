'use client';
import ThemeProvider from '@/theme/ThemeProvider';
import AdminLayout from '@/components/AdminLayout';
import { usePathname } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {isLoginPage ? children : <AdminLayout>{children}</AdminLayout>}
        </ThemeProvider>
      </body>
    </html>
  );
}
