import React from "react";
import DynamicHeader from "@/components/DynamicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <DynamicHeader
        logoText="PaperForge"
        actions={ (role !== "admin" && role !== "teacher")  ?[]: [
          { label: "Create Paper", onClick: () => (navigate("/")) },
          { label: "Papers", onClick: () => (navigate("/papers")) },
        ] }
      />

      {/* Profile Info */}
      <main className="container py-10 max-w-2xl">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6">
            <ProfileField label="Full Name" value={user?.fullName} />
            <ProfileField label="Email" value={user?.email} />
            <ProfileField label="Mobile" value={user?.mobile} />
            <ProfileField label="Role" value={user?.role} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

interface ProfileFieldProps {
  label: string;
  value?: string;
}

function ProfileField({ label, value }: ProfileFieldProps) {
  return (
    <div className="grid grid-cols-3 items-center">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="col-span-2 font-medium">{value || "-"}</div>
    </div>
  );
}
