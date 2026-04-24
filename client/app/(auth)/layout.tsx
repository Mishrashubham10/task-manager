import Footer from '@/components/layouts/Footer';
import { ReactNode } from 'react';

interface AuthProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthProps) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}