"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
          <Separator />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select id="language" defaultValue="en">
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">French</option>
              <option value="sw">Kiswahili</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="documentLanguage">Document Language</Label>
            <Select id="documentLanguage" defaultValue="en">
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">French</option>
              <option value="sw">Kiswahili</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">Free Plan</p>
              <p className="text-sm text-muted-foreground">5 document credits remaining</p>
            </div>
            <Button>Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
