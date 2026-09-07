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
      <main className="pl-64 w-full min-h-screen">
        <div className="px-8 py-8 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
