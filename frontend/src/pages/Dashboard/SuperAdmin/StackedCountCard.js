import { useState, useRef } from "react";

const cardsData = [
  {
    id: "clients",
    title: "Clients",
    value: 128,
    gradient: "from-purple-500 via-indigo-600 to-blue-700",
  },
  {
    id: "admins",
    title: "Admins",
    value: 3,
    gradient: "from-orange-500 via-amber-600 to-yellow-600",
  },
  {
    id: "delivery",
    title: "Delivery Partners",
    value: 12,
    gradient: "from-emerald-500 via-green-600 to-teal-700",
  },
];

const SwipeableLayeredStatsCard = () => {
  const [cards, setCards] = useState(cardsData);
  const startX = useRef(0);
  const dragging = useRef(false);

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

    // 🚀 FAST swap trigger
    if (Math.abs(diff) > 20) {
      dragging.current = false;
      rotateCards();
    }
  };

  const onEnd = () => {
    dragging.current = false;
  };

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
