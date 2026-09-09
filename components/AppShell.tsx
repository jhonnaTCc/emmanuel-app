import Sidebar from './Sidebar';

export default function AppShell({
  fullName,
  role,
  children,
}: {
  fullName: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar fullName={fullName} role={role} />
      <main className="md:pl-64 w-full min-h-screen pt-16 md:pt-0">
        <div className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
