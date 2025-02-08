import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

export default function LbLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="w-full pt-16">{children}</main>
      </div>
    </>
  );
}
