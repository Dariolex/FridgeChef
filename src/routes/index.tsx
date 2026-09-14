import { createFileRoute } from "@tanstack/react-router";
import { FridgeChef } from "@/components/fridgechef";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <FridgeChef />;
}
