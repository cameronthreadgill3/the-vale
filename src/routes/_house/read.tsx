import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_house/read")({ component: ReadLayout });

function ReadLayout() {
  return <Outlet />;
}
