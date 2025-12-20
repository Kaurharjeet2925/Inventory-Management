import { useEffect, useRef, useState } from "react";
import { apiClient } from "../../../apiclient/apiclient";

const SwipeableLayeredStatsCard = () => {
  const [cards, setCards] = useState([]);
  const startX = useRef(0);
  const dragging = useRef(false);

  /* ----------------------------
     LOAD DATA FROM BACKEND
  ----------------------------- */
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiClient.get("/user-stats");

        setCards([
          {
            id: "clients",
            title: "Clients",
            value: res.data.clients || 0,
            gradient: "from-purple-500 via-indigo-600 to-blue-700",
          },
          {
            id: "admins",
            title: "Admins",
            value: res.data.admins || 0,
            gradient: "from-orange-500 via-amber-600 to-yellow-600",
          },
          {
            id: "delivery",
            title: "Delivery Partners",
            value: res.data.delivery || 0,
            gradient: "from-emerald-500 via-green-600 to-teal-700",
          },
        ]);
      } catch (err) {
        console.error("Failed to load user stats", err);
      }
    };

    loadStats();
  }, []);

  /* ----------------------------
     SWIPE LOGIC (UNCHANGED)
  ----------------------------- */
  const rotateCards = () => {
    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const onStart = (x) => {
    startX.current = x;
    dragging.current = true;
  };

  const onMove = (x) => {
    if (!dragging.current) return;
    const diff = x - startX.current;

    // ⚡ fast swap
    if (Math.abs(diff) > 20) {
      dragging.current = false;
      rotateCards();
    }
  };

  const onEnd = () => {
    dragging.current = false;
  };

  /* ----------------------------
     LOADING STATE
  ----------------------------- */
  if (!cards.length) {
    return (
      <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  /* ----------------------------
     UI
  ----------------------------- */
  return (
    <div className="relative h-64 w-full select-none">
      {cards.map((card, index) => (
        <div
          key={card.id}
          onMouseDown={(e) => onStart(e.clientX)}
          onMouseMove={(e) => onMove(e.clientX)}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
          onTouchStart={(e) => onStart(e.touches[0].clientX)}
          onTouchMove={(e) => onMove(e.touches[0].clientX)}
          onTouchEnd={onEnd}
          className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-br ${card.gradient}
            text-white p-6 shadow-xl
            cursor-grab active:cursor-grabbing
            transition-transform duration-150 ease-out
          `}
          style={{
            transform: `translate(${index * 10}px, ${index * 10}px) scale(${1 - index * 0.04})`,
            zIndex: cards.length - index,
            opacity: index === 0 ? 1 : 0.9,
          }}
        >
          {/* Decorative */}
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full border border-white/20" />
          <div className="absolute top-10 right-10 h-24 w-24 rounded-full border border-white/10" />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider opacity-80">
                Total
              </p>
              <h3 className="mt-3 text-lg font-semibold">
                {card.title}
              </h3>
            </div>

            <div className="text-4xl font-extrabold">
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SwipeableLayeredStatsCard;
