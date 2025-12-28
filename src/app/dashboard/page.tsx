import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const session = await auth();

  // Additional check (middleware should handle this, but good to have as backup)
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Check if user doesn't have an email (null, undefined, or empty string)
  const userEmail = session.user.email;
  if (!userEmail || (typeof userEmail === "string" && userEmail.trim() === "")) {
    redirect("/auth/complete-profile");
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#00669A]">Dashboard</h1>
            <SignOutButton />
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Welcome back!
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-lg text-gray-900">
                    {user.name || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-lg text-gray-900">{user.email}</p>
                </div>
                {user.image && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Profile Picture
                    </p>
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Account Information
              </h3>
              <p className="text-blue-700">
                You are successfully signed in to your account. This is a
                protected page that only authenticated users can access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

