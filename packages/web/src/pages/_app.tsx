import type { AppProps } from 'next/app';
import { Vazirmatn } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-amline-ui',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export default function AmlineApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${vazirmatn.variable} amline-font-root`}>
      <ThemeProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
