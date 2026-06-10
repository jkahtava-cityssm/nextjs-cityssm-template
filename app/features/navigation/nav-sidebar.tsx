'use client';

import * as React from 'react';

import { Calendar, ChevronRight, LifeBuoy, NotebookPen, Send, Settings2 } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import DynamicIcon, { IconName } from '../../../components/ui/icon-dynamic';
import Image from 'next/image';

import { Sidebar, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';

import { Skeleton } from '../../../components/ui/skeleton';
import { useSession } from '@/contexts/SessionProvider';

import { BadgeColored } from '../../../components/ui/badge-colored';
import { parse } from 'date-fns';
import { useMemo } from 'react';

import { useSearchParams } from 'next/navigation';
import { NavigationPermissions } from './permissions/navigation.permissions';
import { APP_FULL_URL, navigateURL, ROUTES } from '@/lib/api-helpers';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isPending } = useSession();

  if (isPending) {
    return (
      <div className="top-(--header-height) h-[calc(100svh-var(--header-height))]!">
        <div className="flex flex-col bg-sidebar border-r h-full w-full ">
          <div className="flex min-h-0 flex-1 flex-col ">
            <div className="flex flex-col gap-2 p-2 h-16 w-64">
              <Skeleton className="h-full"></Skeleton>
            </div>
            <div className="relative flex w-full min-w-0 flex-col p-2">
              <div className="pr-2 py-2">
                <Skeleton className="h-4" />
              </div>

              <div className="pr-2 mb-1">
                <Skeleton className="h-8" />
              </div>
              <div className="flex flex-col px-2.5 py-0.5 mx-3.5 border-l gap-1">
                <Skeleton className="h-7" />
                <Skeleton className="h-7" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-2 h-16 w-64">
            <Skeleton className="h-full "></Skeleton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavigationPermissions.Provider>
      <PrivateSidebar />
    </NavigationPermissions.Provider>
  );
}

function PrivateSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { can, canAny } = NavigationPermissions.usePermissions();

  const editPermissions = can('EditPermissions');
  const editConfiguration = can('EditConfiguration');
  const editUsers = can('EditUsers');

  const hasSettingsAccess = canAny(editPermissions, editConfiguration, editUsers);

  return (
    <Sidebar className="z-50 top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
      <SideBarHeaderGroup
        imagePath={`${APP_FULL_URL}/images/menu_logo.svg`}
        altText="An image of the crest and wreath of the city of Sault Ste. Marie"
        title="Room Scheduling/Booking"
        subtitle="The City of Sault Ste. Marie"
        url={ROUTES.protectedRedirect}
      ></SideBarHeaderGroup>

      <SidebarContent>
        <SideBarGroup title="Application">
          <SideBarPrimaryMenuItem title={'Landing'} icon={<NotebookPen />} url={ROUTES.protectedRedirect} />
          {hasSettingsAccess && (
            <SideBarCollapsibleGroup isOpenByDefault={false} title={'Settings'} icon={<Settings2 />}>
              {editPermissions && <SideBarSubMenuItem title={'Manage Permissions'} url={'/settings/manage-permissions'} />}
              {editConfiguration && <SideBarSubMenuItem title={'Manage Configuration'} url={'/settings/manage-configuration'} />}
              {editUsers && <SideBarSubMenuItem title={'Manage Users'} url={'/settings/manage-users'} />}
            </SideBarCollapsibleGroup>
          )}
        </SideBarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SideBarGroup title="">
          <SideBarPrimaryMenuItem title={'Support'} icon={<LifeBuoy />} url={'#'} />
        </SideBarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}

export function SideBarHeaderGroup({
  imagePath = `${APP_FULL_URL}/images/menu_logo.svg`,
  altText,
  title,
  subtitle,
  url,
}: {
  imagePath?: string;
  altText: string;
  title: string;
  subtitle: string;
  url: string;
}) {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <Link href={url}>
              <div className="flex aspect-square size-8 items-center justify-center">
                <Image src={imagePath} alt={altText} width={32} height={32} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{title}</span>
                <span className="cenet text-xs">{subtitle}</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

export function SideBarGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>{children}</SidebarMenu>
    </SidebarGroup>
  );
}

export function SideBarCollapsibleGroup({
  icon,
  isOpenByDefault,
  title,
  children,
}: {
  icon?: React.ReactNode;
  isOpenByDefault: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible defaultOpen={isOpenByDefault} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title}>
            {icon}
            <span>{title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        {children}
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function SideBarPrimaryMenuItem({ title, icon, url }: { title: string; icon?: React.ReactNode; url: string }) {
  return (
    <SidebarMenuButton asChild key={title} tooltip={title}>
      <Link href={url}>
        {icon}
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export function SideBarSubMenuItem({
  title,
  iconName,
  url,
  rightIndicator,
}: {
  title: string;
  iconName?: IconName;
  url: string;
  rightIndicator?: React.ReactNode;
}) {
  return (
    <CollapsibleContent>
      <SidebarMenuSub>
        <SidebarMenuSubItem key={title}>
          <SidebarMenuSubButton asChild>
            <Link href={url}>
              {iconName && <DynamicIcon name={iconName} />}
              <span>{title}</span>
              {rightIndicator}
            </Link>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      </SidebarMenuSub>
    </CollapsibleContent>
  );
}
