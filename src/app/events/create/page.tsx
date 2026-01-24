import { redirect } from "next/navigation";

/**
 * Event creation page
 * 
 * Events must be created within a community.
 * This page redirects users to the communities page to select a community first.
 */
export default async function CreateEventPage() {
  // Redirect to communities page - events must be created within a community
  redirect("/communities");
}
