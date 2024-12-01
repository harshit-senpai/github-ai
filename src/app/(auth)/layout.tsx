export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-full w-full items-center justify-center bg-gray-200/70">
      {children}
    </main>
  );
}
