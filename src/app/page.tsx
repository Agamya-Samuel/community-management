import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CreditCard, BarChart3, Zap, Globe, MessageSquare, Star, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

import { Navbar } from "@/components/Navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-background"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6">
              🎉 New: AI-Powered Event Matching
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 font-[family-name:var(--font-playfair)] text-balance">
              Effortless Event Management, Ticketing, and Engagement in One Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty">
              From planning to post-event analytics, streamline everything with EventFlow. Create memorable experiences
              that engage attendees and drive results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo Video
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-playfair)]">
              Everything you need to create amazing events
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools that work together seamlessly to handle every aspect of your event lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Event Website Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Drag-and-drop custom sites and registration pages. No coding required.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Ticketing System</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Flexible pricing, secure payments, and seamless access control for all event types.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Attendee Networking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI matchmaking, mobile app, and live interactions to connect your attendees.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time insights and ROI reports to measure success and improve future events.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-playfair)]">
              How EventFlow Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create unforgettable events that engage and inspire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Plan & Promote</h3>
              <p className="text-muted-foreground">
                Create stunning event pages and launch marketing campaigns with built-in tools.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Register & Ticket</h3>
              <p className="text-muted-foreground">
                Streamline registration with custom forms and secure payment processing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Engage On-Site</h3>
              <p className="text-muted-foreground">
                Keep attendees connected with mobile apps, networking, and live interactions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Analyze & Follow-Up</h3>
              <p className="text-muted-foreground">
                Measure success with detailed reports and maintain relationships post-event.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-[family-name:var(--font-playfair)]">
              Trusted by event organizers worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;EventFlow transformed how we manage our annual conference. The networking features alone increased
                  attendee satisfaction by 40%.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Event Director, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;The analytics dashboard gives us insights we never had before. We&apos;ve improved our ROI by 60% using
                  EventFlow&apos;s data.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">MR</span>
                  </div>
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Marketing Manager, StartupHub</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &quot;Setup was incredibly easy, and our attendees love the mobile app. EventFlow made our virtual
                  conference feel truly engaging.&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-semibold text-primary">EC</span>
                  </div>
                  <div>
                    <p className="font-semibold">Emily Chen</p>
                    <p className="text-sm text-muted-foreground">Founder, DesignCon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">99%</div>
                <div className="text-sm text-muted-foreground">Attendee Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">50%</div>
                <div className="text-sm text-muted-foreground">Faster Planning</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Events Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-[family-name:var(--font-playfair)]">
                Ready to transform your events?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of event organizers who trust EventFlow to create memorable experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                <Input placeholder="Enter your email" className="bg-primary-foreground text-foreground border-0" />
                <Button variant="secondary" size="lg" className="whitespace-nowrap" asChild>
                  <Link href="/auth/sign-up">Get Started Free</Link>
                </Button>
              </div>
              <p className="text-sm opacity-75 mt-4">Start your 14-day free trial today. No credit card required.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground font-[family-name:var(--font-playfair)]">
                  EventFlow
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                The all-in-one platform for effortless event management, ticketing, and attendee engagement.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm">
                  Facebook
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© 2024 EventFlow. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground">Powered by:</span>
              <div className="flex space-x-2">
                <Badge variant="outline">Stripe</Badge>
                <Badge variant="outline">Salesforce</Badge>
                <Badge variant="outline">Zoom</Badge>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm text-center mt-4">Developed by Agamya, Aditya, Jaish</p>
        </div>
      </footer>
    </div>
  )
}
