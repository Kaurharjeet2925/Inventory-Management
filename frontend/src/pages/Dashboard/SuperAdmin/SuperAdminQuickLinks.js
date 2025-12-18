import {
  Users,
  Package,
  Warehouse,
  FileBarChart,
  ShoppingCart
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const links = [
  {
    title: "Users",
    icon: Users,
    path: "/profile/alladmin",
    iconBg: "bg-blue-600",
    bg: "from-blue-500 to-blue-400"
  },
  {
    title: "Products",
    icon: Package,
    path: "/manage-products/products",
    iconBg: "bg-green-600",
    bg: "from-green-500 to-green-400"
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    path: "/orders/view-order",
    iconBg: "bg-purple-600",
    bg: "from-purple-500 to-purple-400"
  },
  {
    title: "Warehouses",
    icon: Warehouse,
    path: "/manage-products/location",
    iconBg: "bg-indigo-600",
    bg: "from-indigo-500 to-indigo-400"
  },
  {
    title: "Sales Report",
    icon: FileBarChart,
    path: "/reports/sales-reports",
    iconBg: "bg-orange-600",
    bg: "from-orange-500 to-orange-400"
  },
  {
    title: "Inventory Report",
    icon: FileBarChart,
    path: "/reports/inventory-reports",
    iconBg: "bg-gray-700",
    bg: "from-gray-500 to-gray-400"
  }
];

const SuperAdminQuickLinks = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
      {links.map((link, i) => {
        const Icon = link.icon;

        return (
          <div
            key={i}
            onClick={() => navigate(link.path)}
            className={`cursor-pointer 
              rounded-xl
               p-3 min-h-[30px] 
               transition transform
                hover:-translate-y-1 
                hover:shadow-xl 
          bg-gradient-to-r ${link.bg}`}
          >
           <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-white/25 text-white">
                <Icon size={14} />
              </div>
              <span className="text-sm font-semibold text-white whitespace-nowrap">
                {link.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SuperAdminQuickLinks;
