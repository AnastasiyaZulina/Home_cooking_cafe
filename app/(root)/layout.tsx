import type { Metadata } from "next";

import { Header } from "@/shared/components/shared";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Скатерть-самобранка | Главная",
  description: "Описание",
};

export default function HomeLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className='min-h-screen bg-white'>
      <Suspense>
        <Header />
      </Suspense>
      {children}
      {modal}
    </main>
  );
}
