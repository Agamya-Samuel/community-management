import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Crown, Calendar, CreditCard, X } from "lucide-react";
import Link from "next/link";
import { getUserSubscription } from "@/lib/subscription/utils";
import { ManageSubscriptionClient } from "@/components/subscription/manage-subscription-client";

/**
 * Subscription management page
 * 
 * Shows current subscription status and allows management
 */
export default async function ManageSubscriptionPage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/subscription/manage");
  }

  const user = session.user;

  // Get user's subscription
  const subscription = await getUserSubscription(user.id);

  // If no subscription, redirect to upgrade
  if (!subscription) {
    redirect("/subscription/upgrade");
  }

  // Format dates
  const startDate = subscription.startDate
    ? new Date(subscription.startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

  const endDate = subscription.endDate
    ? new Date(subscription.endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const isComplimentary = subscription.planType === "wikimedia_complimentary";
  const isActive = subscription.status === "active";
  const isCancelled = !subscription.autoRenew;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-foreground">
              Subscription Management
            </h1>
          </div>
        </div>

        {/* Subscription Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Premium Subscription
                  {isActive && (
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  )}
                  {!isActive && (
                    <Badge variant="secondary">
                      {subscription.status}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {isComplimentary
                    ? "Wikimedia Complimentary Access"
                    : `${subscription.planType === "monthly" ? "Monthly" : "Annual"} Plan`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Type</p>
                  <p className="font-semibold text-foreground">
                    {isComplimentary
                      ? "Wikimedia Complimentary"
                      : subscription.planType === "monthly"
                      ? "Monthly Plan"
                      : "Annual Plan"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-semibold text-foreground">{startDate}</p>
                </div>
                {endDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isCancelled ? "Expires" : "Next Billing"}
                    </p>
                    <p className="font-semibold text-foreground">{endDate}</p>
                  </div>
                )}
                {!isComplimentary && subscription.amountPaid && (
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold text-foreground">
                      {subscription.currency} {subscription.amountPaid}
                    </p>
                  </div>
                )}
              </div>

              {/* Auto-renewal Status */}
              {!isComplimentary && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Auto-renewal
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.autoRenew
                          ? "Your subscription will automatically renew"
                          : "Your subscription will not renew"}
                      </p>
                    </div>
                    <Badge variant={subscription.autoRenew ? "default" : "secondary"}>
                      {subscription.autoRenew ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Complimentary Notice */}
              {isComplimentary && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    This is a complimentary subscription granted as part of the
                    Wikimedia partnership program. Thank you for your
                    contributions to Wikimedia!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        {!isComplimentary && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
              <CardDescription>
                Update your subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManageSubscriptionClient
                subscriptionId={subscription.subscriptionId}
                autoRenew={subscription.autoRenew}
              />
            </CardContent>
          </Card>
        )}

        {/* Features Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
            <CardDescription>
              Features included with your Premium subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Unlimited Communities
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create and manage unlimited communities
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Unlimited Events
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create and organize unlimited events
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Advanced Analytics
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Track engagement and growth metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Priority Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get faster response times
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
