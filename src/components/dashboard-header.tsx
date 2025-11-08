import { SidebarTrigger } from "@/components/ui/sidebar";

type DashboardHeaderProps = {
  title: string;
};

export function DashboardHeader({ title }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {title}
        </h2>
      </div>
    </div>
  );
}
