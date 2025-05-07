'use client';

import { Inter } from 'next/font/google';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Real Estate Listing',
  description: 'Find your dream property',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChakraProvider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  );
} 