'use client'
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { User, Briefcase, Building2, Code, HelpCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HoverGradientMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  gradient: string;
  iconColor: string;
}

const menuItems: HoverGradientMenuItem[] = [
  { icon: <User className="h-5 w-5" />, label: "Consumer", href: "#", gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)", iconColor: "group-hover:text-blue-500 dark:group-hover:text-blue-400" },
  { icon: <Briefcase className="h-5 w-5" />, label: "Broker", href: "#", gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)", iconColor: "group-hover:text-orange-500 dark:group-hover:text-orange-400" },
  { icon: <Building2 className="h-5 w-5" />, label: "Business", href: "#", gradient: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(126,34,206,0.06) 50%, rgba(88,28,135,0) 100%)", iconColor: "group-hover:text-purple-500 dark:group-hover:text-purple-400" },
  { icon: <HelpCircle className="h-5 w-5" />, label: "Help", href: "#", gradient: "radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(13,148,136,0.06) 50%, rgba(15,118,110,0) 100%)", iconColor: "group-hover:text-teal-500 dark:group-hover:text-teal-400" },
];

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
};

const sharedTransition = {
  type: "spring" as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

function HoverGradientNavBar(): React.JSX.Element {
  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
        
        {/* Left Side: TradeVault Stylish Text */}
        <div className="font-extrabold text-2xl tracking-tighter text-[#0A2540] italic">
          TradeVault<span className="text-[#4ADE80]">.</span>
        </div>

        {/* Center Side: Hover Gradient Navigation Pill */}
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <motion.nav
            className="w-full md:w-fit mx-auto px-2 md:px-4 py-2 md:py-3 rounded-none md:rounded-3xl relative"
            initial="initial"
            whileHover="hover"
          >
            <ul className="flex items-center justify-around md:justify-center gap-1 md:gap-3 relative z-10">
              {menuItems.map((item: HoverGradientMenuItem) => (
                <motion.li key={item.label} className="relative flex-1 md:flex-none">
                  <motion.div
                    className="block rounded-xl md:rounded-2xl overflow-visible group relative"
                    style={{ perspective: "600px" }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none rounded-xl md:rounded-2xl"
                      variants={glowVariants}
                      style={{
                        background: item.gradient,
                        opacity: 0,
                      }}
                    />
                    <motion.a
                      href={item.href}
                      className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 
                      px-2 py-1.5 md:px-4 md:py-2 relative z-10 
                      bg-transparent text-slate-700 font-semibold
                      group-hover:text-[#0A2540] 
                      transition-colors rounded-xl md:rounded-2xl text-xs md:text-sm"
                      variants={itemVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "center bottom"
                      }}
                    >
                      <span className={`transition-colors duration-300 ${item.iconColor}`}>
                        {item.icon}
                      </span>
                      <span className="hidden md:inline font-medium">{item.label}</span>
                    </motion.a>
                    <motion.a
                      href={item.href}
                      className="flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-2 
                      px-2 py-1.5 md:px-4 md:py-2 absolute inset-0 z-10 
                      bg-transparent text-gray-600 dark:text-gray-300 
                      group-hover:text-gray-900 dark:group-hover:text-slate-800 
                      transition-colors rounded-xl md:rounded-2xl text-xs md:text-sm"
                      variants={backVariants}
                      transition={sharedTransition}
                      style={{
                        transformStyle: "preserve-3d",
                        transformOrigin: "center top",
                        transform: "rotateX(90deg)"
                      }}
                    >
                      <span className={`transition-colors duration-300 ${item.iconColor}`}>
                        {item.icon}
                      </span>
                      <span className="hidden md:inline font-medium">{item.label}</span>
                    </motion.a>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        </div>

        {/* Right Side: Search Panel & SignUp */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center space-x-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 shadow-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent outline-none text-sm w-32 text-gray-700 placeholder:text-gray-400"
            />
          </div>
          <Button className="rounded-full shadow-sm">Sign Up</Button>
        </div>

      </div>
    </div>
  );
}

export default HoverGradientNavBar;
