// PrimeReactProviderConfig.js
"use client"; // This directive is needed for client components

import { PrimeReactProvider } from 'primereact/api';
import Tailwind from 'primereact/passthrough/tailwind';
import ThemeSwitcher from './components/themeSwitcher';

export default function PrimeReactProviderConfig({ children }) {
  return (
    <PrimeReactProvider value={{ unstyled: true, pt: Tailwind }}>
      <ThemeSwitcher />
      {children}
    </PrimeReactProvider>
  );
}
