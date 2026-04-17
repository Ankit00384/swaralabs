import { PageHeader } from "@/components/page-header";

export function VoicesLayout({ 
  children
}: { 
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <PageHeader title="Voices" />
      {children}
    </div>
  );
}