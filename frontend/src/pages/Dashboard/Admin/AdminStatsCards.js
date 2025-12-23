import { ShoppingCart, Clock, CheckCircle, IndianRupee } from "lucide-react";

const cards = [
  {
    title: "Today Orders",
    value: 42,
    icon: ShoppingCart,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Pending Orders",
    value: 8,
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Delivered Orders",
    value: 34,
    icon: CheckCircle,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Today Revenue",
    value: "₹18,450",
    icon: IndianRupee,
    color: "bg-purple-100 text-purple-700",
  },
];

const AdminStatsCards = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
        >
          <div className={`p-3 rounded-lg ${c.color}`}>
            <c.icon size={22} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{c.title}</p>
            <p className="text-xl font-bold text-gray-800">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminStatsCards;
