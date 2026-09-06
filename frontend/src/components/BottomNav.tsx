"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";
import { Home, Sprout, Camera, MessageSquare, History } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useApp();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/analyze", label: "Analyze", icon: Sprout },
    { href: "/live", label: "Live", icon: Camera },
    { href: "/chat", label: "Assistant", icon: MessageSquare },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-emerald-800 border-t border-emerald-700 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition ${
                active ? "text-white font-bold bg-emerald-700/80" : "text-emerald-200 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
