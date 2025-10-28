import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext"; // your auth context
import { useNavigate } from "react-router-dom";

interface HeaderAction {
  label: string;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "destructive"
    | "ghost"
    | "link";
  onClick: () => void | Promise<void>;
  disabled?: boolean;
}

interface DynamicHeaderProps {
  title?: string;
  logoText?: string;
  subTitle?: string;
  logoColorClass?: string;
  actions?: HeaderAction[];
  canSave?: boolean;
  onSave?: () => Promise<void> | void;
}

export default function DynamicHeader({
  title = "PaperForge",
  logoText = "PaperForge",
  logoColorClass = "bg-primary",
  subTitle = "",
  actions = [],
  canSave = false,
  onSave,
}: DynamicHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log(actions);

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="container py-4 flex items-center justify-between">
        {/* Left Section - Logo / Title */}
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-md ${logoColorClass}`} />
          <span className="font-extrabold tracking-tight text-xl">
            {logoText}
          </span>
          <span className="text-sm text-muted-foreground">{subTitle}</span>
        </div>

        {/* Right Section - Actions + Profile */}
        <div className="flex items-center gap-3">
          {/* Dynamic Action Buttons */}
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.label}
            </Button>
          ))}

          {/* Save Button (separate for clarity) */}
          {onSave && (
            <Button onClick={onSave} disabled={!canSave}>
              Save
            </Button>
          )}

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage
                    src={user?.avatar || ""}
                    alt={user?.fullName || "User"}
                  />
                  <AvatarFallback>
                    {user?.fullName
                      ? user.fullName[0].toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 mt-2" align="end">
              <DropdownMenuLabel>
                {user?.fullName || "User Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {navigate("/profile");}}
                className="cursor-pointer"
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-red-600"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
