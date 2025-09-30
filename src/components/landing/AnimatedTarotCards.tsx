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
    initialX: -200,
    initialY: -150,
    rotation: -15,
  },
  {
    id: "the-star",
    src: "/images/hero/40_the_star.png",
    alt: "The Star Tarot Card",
    initialX: 200,
    initialY: -100,
    rotation: 20,
  },
  {
    id: "wheel-of-fortune",
    src: "/images/hero/40_wheel_of_fortune.png",
    alt: "Wheel of Fortune Tarot Card",
    initialX: -100,
    initialY: 200,
    rotation: 10,
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
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tarotCards.map((card, index) => (
        <motion.div
          key={card.id}
          className="absolute"
          initial={{
            x: card.initialX,
            y: card.initialY,
            rotate: card.rotation,
            opacity: 0,
            scale: 0.5,
          }}
          animate={
            isVisible
              ? {
                  x: [
                    card.initialX,
                    card.initialX + 50,
                    card.initialX + 20,
                    card.initialX + 80,
                    card.initialX + 40,
                  ],
                  y: [
                    card.initialY,
                    card.initialY - 30,
                    card.initialY + 20,
                    card.initialY - 10,
                    card.initialY + 15,
                  ],
                  rotate: [
                    card.rotation,
                    card.rotation + 5,
                    card.rotation - 3,
                    card.rotation + 8,
                    card.rotation - 2,
                  ],
                  opacity: [0, 0.8, 0.9, 0.7, 0.85],
                  scale: [0.5, 1, 0.95, 1.05, 1],
                }
              : {}
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: index * 0.8,
          }}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* Card Glow Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-lg blur-lg"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
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
              className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.7 + 1,
              }}
            />
          </motion.div>

          {/* Floating Sparkles */}
          {[...Array(3)].map((_, sparkleIndex) => (
            <motion.div
              key={`sparkle-${sparkleIndex}`}
              className="absolute w-2 h-2 bg-accent rounded-full"
              animate={{
                x: [0, 20, -15, 25, 0],
                y: [0, -25, 15, -20, 0],
                opacity: [0, 1, 0.5, 1, 0],
                scale: [0, 1, 0.5, 1, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.3 + sparkleIndex * 0.5,
              }}
              style={{
                left: `${20 + sparkleIndex * 30}%`,
                top: `${10 + sparkleIndex * 20}%`,
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