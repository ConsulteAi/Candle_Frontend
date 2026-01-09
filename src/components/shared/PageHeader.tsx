"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface PageHeaderProps {
  backHref: string;
  backLabel: string;
  icon: LucideIcon;
  iconGradient?: string;
  badge: string;
  title: React.ReactNode;
  description: string;
}

export default function PageHeader({
  backHref,
  backLabel,
  icon: Icon,
  iconGradient = "from-blue-600 to-cyan-500",
  badge,
  title,
  description,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="container relative py-12 lg:py-16">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl"
        >
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${iconGradient} text-white text-sm font-medium mb-6`}
          >
            <Icon className="w-4 h-4" />
            {badge}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {title}
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl">{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
