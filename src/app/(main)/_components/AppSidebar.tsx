"use client";

import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { SidebarItems } from "~/constants";
import useProject from "~/hooks/useProjects";
import { cn } from "~/lib/utils";

export const AppSidebar = () => {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { projects, setProjectId, projectId } = useProject();

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className="h-[calc(100vh-1rem)]"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Image
            src={"/github-ai.svg"}
            height={35}
            width={35}
            alt="github-ai"
          />
          {open && <h1 className="text-xl font-bold">Github AI</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn({
                        "bg-primary text-white": pathname === item.url,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-4">
          <Separator />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project) => (
                <SidebarMenuItem key={project.projectName}>
                  <SidebarMenuButton asChild>
                    <div onClick={() => setProjectId(project.id)}>
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-sm border bg-white text-sm text-primary",
                          {
                            "bg-primary text-white": projectId === project.id,
                          },
                          {
                            "px-2": !open,
                          },
                        )}
                      >
                        {project.projectName[0]}
                      </div>
                      {open && <span>{project.projectName}</span>}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <div className="h-2" />
              {open && (
                <SidebarMenuItem>
                  <Link href={"/create"}>
                    <Button size={"sm"} variant={"outline"} className="w-fit">
                      <Plus />
                      Create Project
                    </Button>
                  </Link>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
