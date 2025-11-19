"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { SelectItem,Select,SelectContent,SelectTrigger,SelectValue } from '@/components/ui/select';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userData?.displayName || '',
    email: userData?.email || '',
    clientType: userData?.clientType || '',
    age: userData?.age || '',
    height: userData?.height || '',
    weight: userData?.weight || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!user) return;

    // Update Firestore user document
    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
      displayName: formData.displayName,
      clientType: formData.clientType,
      age: formData.age,
      height: formData.height,
      weight: formData.weight,
      updatedAt: new Date(),
    });

    toast.success("Profile updated successfully!");
    window.location.reload();

  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error("Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-app-gradient">
      <Header />
      <Toaster />
      
      <main className="container mx-auto p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                  <AvatarFallback className="text-2xl">
                    {userData?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{userData?.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{userData?.email}</p>
                </div>
              </div>

              <div className="grid gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">                  
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{userData?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-muted-foreground">
                      {userData?.createdAt && format(userData.createdAt.toDate(), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className='space-y-3'>
                  <Label htmlFor="targetClient">Client Type</Label>
                  <Select
                value={formData.clientType || ''}
                onValueChange={(value) => setFormData({ ...formData, clientType: value })}
                required
              >
                <SelectTrigger id="clientType">
                  <SelectValue placeholder="Select your fitness focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="StrengthTraining">
                    Strength Training
                  </SelectItem>
                  <SelectItem value="FatLoss">Fat Loss</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                </SelectContent>
              </Select>
                </div>

                <div className='space-y-3'>
                  <Label htmlFor="age">Age</Label>
                  <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData,age:e.target.value})}
                  placeholder='18'
                  />
                </div>

                <div className='space-y-3'>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData,height:e.target.value})}
                  placeholder='170' 
                  />
                </div>

                <div className='space-y-3'>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData,weight:e.target.value})}
                  placeholder='70'
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <CardDescription>Your fitness journey overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Total Workouts</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-2xl font-bold text-primary">0</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
