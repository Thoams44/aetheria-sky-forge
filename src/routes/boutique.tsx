import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/boutique")({
  component: () => <Outlet />,
});
