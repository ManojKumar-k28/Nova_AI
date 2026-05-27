import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: string;
  index?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  accentColor = "text-accent-blue",
  index = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="glass relative group p-6 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.45)] cursor-pointer"
    >
      {/* Background Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute -inset-px bg-gradient-to-r from-accent-blue via-accent-violet to-accent-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl pointer-events-none blur-sm" />

      {/* Icon Container */}
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center border border-white/[0.05] mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon className={`w-6 h-6 ${accentColor}`} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
