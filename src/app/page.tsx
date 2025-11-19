"use client";

import Link from 'next/link';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Target, TrendingUp, Bell, Shield, Smartphone, BarChart3, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <section className="relative py-20 px-4 bg-blue-100 from-primary/10 via-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                Transform Your Fitness Journey with{' '}
                <span className="text-primary">RepVault</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Track workouts, set goals, and monitor your progress with our comprehensive fitness tracking platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>99.9% Uptime</span>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 p-8 absolute inset-0">
                <Card className="transform hover:scale-105 transition-transform group">
                  <CardHeader className="pb-3">
                    <Activity className="h-8 w-8 text-primary mb-2 group-hover:text-red-500" />
                    <CardTitle className="text-2xl">12.5K</CardTitle>
                    <CardDescription>Steps Today</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="transform hover:scale-105 transition-transform group">
                  <CardHeader className="pb-3">
                    <TrendingUp className="h-8 w-8 text-primary mb-2 group-hover:text-orange-500" />
                    <CardTitle className="text-2xl">450</CardTitle>
                    <CardDescription>Calories Burned</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="transform hover:scale-105 transition-transform group">
                  <CardHeader className="pb-3">
                    <Target className="h-8 w-8 text-primary mb-2 group-hover:text-green-500" />
                    <CardTitle className="text-2xl">8/10</CardTitle>
                    <CardDescription>Goals Achieved</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="transform hover:scale-105 transition-transform group">
                  <CardHeader className="pb-3">
                    <BarChart3 className="h-8 w-8 text-primary mb-2 group-hover:text-purple-500" />
                    <CardTitle className="text-2xl">72</CardTitle>
                    <CardDescription>BPM Heart Rate</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to track and improve your fitness
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-[0_0_20px_5px_rgba(255,0,0,0.8)] transition-shadow">
              <CardHeader>
                <Activity className="h-12 w-12 text-primary mb-4 group-hover:text-red-500" />
                <CardTitle>Activity Tracking</CardTitle>
                <CardDescription>
                  Monitor your daily steps, calories burned, distance traveled, and active minutes in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='group hover:shadow-[0_0_20px_5px_rgba(0,128,0,0.8)] transition-shadow'>
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4 group-hover:text-green-500" />
                <CardTitle>Goal Management</CardTitle>
                <CardDescription>
                  Set personalized fitness goals and track your progress with detailed analytics and insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='group hover:shadow-[0_0_20px_5px_rgba(128,0,128,0.8)] transition-shadow'>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-primary mb-4 group-hover:text-purple-600" />
                <CardTitle>Workout Logging</CardTitle>
                <CardDescription>
                  Log workouts manually or automatically detect activities with comprehensive workout history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='group hover:shadow-[0_0_20px_5px_rgba(255,255,0,0.8)] transition-shadow'>
              <CardHeader>
                <Heart className="h-12 w-12 text-primary mb-4 group-hover:text-yellow-500" />
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>
                  Track heart rate, calories, and other vital health metrics to optimize your workouts.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='group hover:shadow-[0_0_20px_5px_rgba(255,165,0,0.8)] transition-shadow'>
              <CardHeader>
                <Bell className="h-12 w-12 text-primary mb-4 group-hover:text-orange-400" />
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  Receive personalized reminders and notifications to stay on track with your fitness goals.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className='group hover:shadow-[0_0_20px_5px_rgba(0,0,255,0.8)] transition-shadow'>
              <CardHeader>
                <Smartphone className="h-12 w-12 text-primary mb-4 group-hover:text-blue-500" />
                <CardTitle>Multi-Platform Sync</CardTitle>
                <CardDescription>
                  Seamlessly sync data across devices and integrate with Google Fit and Apple Health.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">10K+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">1M+</h3>
              <p className="text-muted-foreground">Workouts Logged</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">99.9%</h3>
              <p className="text-muted-foreground">Uptime</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-primary mb-2">24/7</h3>
              <p className="text-muted-foreground">Support</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold mb-4">About RepVault</h2>
            <p className="text-lg text-muted-foreground">
              RepVault is a comprehensive fitness tracking platform designed to help users monitor their physical activity, 
              set personalized fitness goals, and track progress over time. Our app connects users with personalized health 
              insights to ensure accurate tracking and motivation.
            </p>
            <p className="text-lg text-muted-foreground">
              Built with security and privacy in mind, RepVault is fully HIPAA and GDPR compliant, ensuring your health 
              data is always protected. We support integration with popular fitness platforms like Google Fit and Apple Health 
              for seamless data synchronization.
            </p>
            <div className="pt-8">
              <Button size="lg" asChild>
                <Link href="/register">Start Your Journey Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">RepVault</h3>
              <p className="text-sm text-muted-foreground">
                Your complete fitness tracking solution
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/integrations" className="hover:text-primary">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                <li><Link href="/compliance" className="hover:text-primary">Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} RepVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}