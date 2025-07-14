"use client";

import { Sparkles, Menu, User } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Logo } from "@/components/ui";

export function ChatHeader() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-4 bg-primary text-primary-content shadow-lg">
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-10 h-10 rounded-full bg-primary-content/20 flex items-center justify-center overflow-hidden">
            <Logo size="sm" showText={false} variant="white" />
          </div>
        </div>

        <div>
          <h1 className="text-lg font-bold">MiMi โหรยิปซี</h1>
          <p className="text-sm opacity-80">พร้อมดูดวงให้คุณแล้ว ✨</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <div className="avatar">
            <div className="w-8 h-8 rounded-full">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-content/20 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        )}

        <button className="btn btn-ghost btn-sm btn-square">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
