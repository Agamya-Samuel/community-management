import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { hasActiveSubscription } from "@/lib/subscription/utils";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { UpgradeSubscriptionForm } from "@/components/subscription/upgrade-subscription-form";

/**
 * Subscription upgrade page
 * 
 * Shows pricing plans and subscription form for standard users (Google/Email)
 * Wikimedia users are redirected to the request page
 */
export default async function UpgradeSubscriptionPage() {
  // Get session from better-auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/subscription/upgrade");
  }

  const user = session.user;

  // Check if user already has active subscription
  const hasSubscription = await hasActiveSubscription(user.id);
  if (hasSubscription) {
    redirect("/subscription/manage");
  }

  // CRITICAL: If IS_MEDIA_WIKI is true, redirect EVERYONE to request page
  // Payment page should NEVER be shown when this flag is enabled
  const isGlobalMediaWikiMode = process.env.IS_MEDIA_WIKI === "true" || process.env.IS_MEDIAWIKI === "true";
  if (isGlobalMediaWikiMode) {
    redirect("/subscription/request");
  }

  // Check if user is a Wikimedia user (should use request flow instead)
  const userAccounts = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, user.id));

  const isWikimediaUser = userAccounts.some(
    (acc) => acc.providerId === "mediawiki"
  );

  if (isWikimediaUser) {
    redirect("/subscription/request");
  }

  // Pricing plans
  const plans = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "₹499",
      priceUsd: "$6",
      period: "per month",
      description: "Perfect for trying out Premium features",
      features: [
        "Create unlimited communities",
        "Sub-chapter hierarchy management",
        "Manage multiple communities",
        "Advanced analytics dashboard",
        "Financial overview and payment tracking",
        "Priority support",
        "Early access to new features",
      ],
    },
    {
      id: "annual",
      name: "Annual Plan",
      price: "₹4,999",
      priceUsd: "$60",
      period: "per year",
      description: "Best value - Save 2 months",
      savings: "Save ₹999",
      popular: true,
      features: [
        "Everything in Monthly Plan",
        "Save 2 months compared to monthly billing",
        "Best value for long-term users",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-4xl font-bold text-foreground">
                Upgrade to Premium
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Unlock unlimited communities, events, and advanced features
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      ({plan.priceUsd})
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.period}
                  </p>
                  {plan.savings && (
                    <Badge variant="secondary" className="mt-2">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <UpgradeSubscriptionForm planType={plan.id as "monthly" | "annual"} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
            <CardDescription>
              Everything you need to build and manage thriving communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Unlimited Communities
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create and manage as many communities as you need
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Sub-Chapter Management
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Organize communities with hierarchical structures
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Advanced Analytics
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Track engagement, growth, and community health metrics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">
                    Priority Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get faster response times and dedicated support
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
