import { createFileRoute } from "@tanstack/react-router";
import { FrigoChef } from "@/components/frigochef";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FrigoChef />;
}
