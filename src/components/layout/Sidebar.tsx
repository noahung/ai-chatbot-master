
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  Code, 
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot } from "@/context/ChatbotContext";

const Sidebar = () => {
  const location = useLocation();
  const { clients } = useChatbot();
  const currentClient = location.pathname.includes('/clients/') ? 
    location.pathname.split('/clients/')[1].split('/')[0] : null;

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      href: "/dashboard/clients",
      icon: Users,
    },
  ];

  const clientNavItems = currentClient ? [
    {
      title: "Details",
      href: `/dashboard/clients/${currentClient}`,
      icon: Bot,
    },
    {
      title: "Training Data",
      href: `/dashboard/clients/${currentClient}/training`,
      icon: FileText,
    },
    {
      title: "Chatbot Settings",
      href: `/dashboard/clients/${currentClient}/settings`,
      icon: Settings,
    },
    {
      title: "Integration",
      href: `/dashboard/clients/${currentClient}/integration`,
      icon: Code,
    }
  ] : [];

  return (
    <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
      <div className="h-full px-3 py-4">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="px-3 text-sm font-medium tracking-tight text-gray-500">
              MAIN
            </h2>
            <nav className="flex flex-col space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-900 hover:bg-gray-100"
                    )
                  }
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </div>

          {currentClient && (
            <div className="space-y-1">
              <h2 className="px-3 text-sm font-medium tracking-tight text-gray-500">
                CLIENT MANAGEMENT
              </h2>
              <nav className="flex flex-col space-y-1">
                {clientNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-900 hover:bg-gray-100"
                      )
                    }
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        <div className="mt-6">
          <Button variant="outline" className="w-full" asChild>
            <NavLink to="/">
              Exit Dashboard
            </NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
