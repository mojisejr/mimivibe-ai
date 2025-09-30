"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface TarotCard {
  id: string;
  src: string;
  alt: string;
  initialX: number;
  initialY: number;
  rotation: number;
}

const tarotCards: TarotCard[] = [
  {
    id: "ace-of-cups",
    src: "/images/hero/40_ace_of_cups.png",
    alt: "Ace of Cups Tarot Card",
    initialX: -180,
    initialY: -60,
    rotation: -12,
  },
  {
    id: "the-star",
    src: "/images/hero/40_the_star.png",
    alt: "The Star Tarot Card",
    initialX: 160,
    initialY: -80,
    rotation: 15,
  },
  {
    id: "wheel-of-fortune",
    src: "/images/hero/40_wheel_of_fortune.png",
    alt: "Wheel of Fortune Tarot Card",
    initialX: -80,
    initialY: 180,
    rotation: 10,
  },
  {
    id: "the-lovers",
    src: "/images/hero/40_the_lovers.png",
    alt: "The Lovers Tarot Card",
    initialX: 180,
    initialY: 120,
    rotation: -18,
  },
  {
    id: "the-sun",
    src: "/images/hero/40_the_sun.png",
    alt: "The Sun Tarot Card",
    initialX: 0,
    initialY: 0,
    rotation: 5,
  },
];

export function AnimatedTarotCards() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full  pointer-events-none">
      {tarotCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute"
          initial={{
            x: card.initialX,
            y: card.initialY,
            rotate: card.rotation,
            opacity: 0,
            scale: 1.2,
          }}
          animate={
            isVisible
              ? {
                  x: [
                    card.initialX,
                    card.initialX + 15,
                    card.initialX - 10,
                    card.initialX + 25,
                    card.initialX - 5,
                    card.initialX + 20,
                    card.initialX,
                  ],
                  y: [
                    card.initialY,
                    card.initialY - 20,
                    card.initialY + 15,
                    card.initialY - 25,
                    card.initialY + 10,
                    card.initialY - 15,
                    card.initialY,
                  ],
                  rotate: [
                    card.rotation,
                    card.rotation + 3,
                    card.rotation - 2,
                    card.rotation + 5,
                    card.rotation - 3,
                    card.rotation + 2,
                    card.rotation,
                  ],
                  opacity: [0, 0.7, 0.9, 0.8, 0.95, 0.85, 0.9],
                  scale: [0.8, 1, 0.98, 1.02, 0.99, 1.01, 1],
                }
              : {}
          }
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "loop",
            ease: [0.4, 0.0, 0.2, 1],
            delay: index * 1.2,
          }}
          style={{
            left: "30%",
            top: "30%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Card Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/25 to-pink-500/30 rounded-lg blur-xl"
            animate={{
              scale: [1, 1.3, 1.1, 1.4, 1],
              opacity: [0.2, 0.5, 0.3, 0.6, 0.4],
              rotate: [0, 5, -3, 8, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: [0.4, 0.0, 0.2, 1],
              delay: index * 0.6,
            }}
          />

          {/* Card Image */}
          <motion.div
            className="relative z-10 w-24 h-36 md:w-32 md:h-48 lg:w-36 lg:h-54 rounded-lg overflow-hidden shadow-2xl"
            whileHover={{
              scale: 1.1,
              rotate: card.rotation + 5,
              transition: { duration: 0.3 },
            }}
          >
            <Image
              src={card.src}
              alt={card.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, (max-width: 1024px) 128px, 144px"
              priority={index === 0}
            />

            {/* Magical Sparkle Overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/15 to-transparent"
              animate={{
                opacity: [0, 0.4, 0.1, 0.5, 0],
                scale: [1, 1.03, 1.01, 1.05, 1],
                rotate: [0, 2, -1, 3, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: [0.4, 0.0, 0.2, 1],
                delay: index * 0.8 + 1,
              }}
            />
          </motion.div>

          {/* Floating Sparkles */}
          {[...Array(4)].map((_, sparkleIndex) => (
            <motion.div
              key={`sparkle-${sparkleIndex}`}
              className={`absolute w-1.5 h-1.5 rounded-full ${
                sparkleIndex % 3 === 0
                  ? "bg-purple-400"
                  : sparkleIndex % 3 === 1
                  ? "bg-blue-400"
                  : "bg-pink-400"
              }`}
              animate={{
                x: [0, 15, -10, 20, -5, 12, 0],
                y: [0, -20, 12, -15, 8, -18, 0],
                opacity: [0, 0.8, 0.4, 1, 0.6, 0.9, 0],
                scale: [0, 1.2, 0.6, 1, 0.8, 1.1, 0],
                rotate: [0, 180, 90, 270, 45, 315, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: [0.4, 0.0, 0.2, 1],
                delay: index * 0.4 + sparkleIndex * 0.6,
              }}
              style={{
                left: `${15 + sparkleIndex * 25}%`,
                top: `${8 + sparkleIndex * 18}%`,
              }}
            />
          ))}
        </motion.div>
      ))}

      {/* Magical Aura Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-secondary/5"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
