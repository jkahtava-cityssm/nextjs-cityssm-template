'use client';

import { signOut } from '@/lib/auth-client';

import { redirect, usePathname } from 'next/navigation';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { CircleUserRound, LogOut } from 'lucide-react';
import { SidebarMenuButton } from './ui/sidebar';

const handleLogOut = (pathname: string) => {
  signOut({
    fetchOptions: {
      onSuccess: () => {
        redirect('/?callbackurl=' + pathname);
      },
    },
  });
};

export function SignOutMenuItem() {
  const pathname = usePathname();

  return (
    <DropdownMenuItem onSelect={() => handleLogOut(pathname)}>
      <LogOut />
      Logout
    </DropdownMenuItem>
  );
}

export function SignOutMenuButton() {
  const pathname = usePathname();

  return (
    <SidebarMenuButton onClick={() => handleLogOut(pathname)}>
      <LogOut />
      Logout
    </SidebarMenuButton>
  );
}

export function SignOutProfileError() {
  const pathname = usePathname();

  return (
    <SidebarMenuButton
      size="lg"
      className="w-56 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors group"
      onClick={() => handleLogOut(pathname)}
    >
      <div className="relative">
        <CircleUserRound className="h-7 w-7 text-destructive/40 group-hover:scale-105 transition-transform group-hover:text-destructive " />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
        </span>
      </div>

      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="font-semibold text-destructive/60 tracking-tight group-hover:text-destructive">Logout</span>
        <span className="text-xs text-destructive/60 flex items-center gap-1 group-hover:text-destructive">
          <span>Profile Error</span>
        </span>
      </div>
      <div className="relative">
        <LogOut className="h-5 w-5 text-destructive/40 scale-90 group-hover:scale-100 group-hover:text-destructive transition-all  duration-200 ease-out  " />
      </div>
    </SidebarMenuButton>
  );
}
