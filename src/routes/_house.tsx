import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HouseShell } from "@/components/house-shell";

export const Route = createFileRoute("/_house")({
  component: HouseLayout,
});

function HouseLayout() {
  return (
    <HouseShell>
      <Outlet />
    </HouseShell>
  );
}
