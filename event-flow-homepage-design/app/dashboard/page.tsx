import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to EventFlow</h1>
          <p className="text-slate-600">Manage your events effortlessly</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Email: {data.user.email}</p>
              <p className="text-sm text-slate-600 mb-4">
                Joined: {new Date(data.user.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
              <CardDescription>Start planning your next event</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Create New Event</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>View your latest events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">No events yet. Create your first event!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
