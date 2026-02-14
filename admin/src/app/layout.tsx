import type { Metadata } from 'next';
import ThemeProvider from '@/theme/ThemeProvider';
import AdminLayout from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'ProMRKTS Admin',
  description: 'Admin dashboard for ProMRKTS platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AdminLayout>{children}</AdminLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
