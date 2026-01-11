"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  XCircle,
  User,
  DollarSign,
  FileText,
  Search,
  AlertTriangle,
  Calendar,
  Building2,
  ChevronDown,
  TrendingUp,
  Shield,
  Clock,
  Mail,
  MapPin,
  Landmark,
  FileX,
} from "lucide-react";
import { CreditReportResponse, PremiumCreditReportResponse } from "@/types/credit";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CreditReportProps {
  report: CreditReportResponse | PremiumCreditReportResponse;
}

// Type guard to check if report is premium
function isPremiumReport(report: CreditReportResponse | PremiumCreditReportResponse): report is PremiumCreditReportResponse {
  return "cadin" in report && "ccf" in report;
}

export default function CreditReport({ report }: CreditReportProps) {
  const isRestricted = report.status === "RESTRICTED";
  const isPremium = isPremiumReport(report);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Status Section - Editorial Style */}
      <StatusHero status={report.status} protocol={report.protocol} />

      {/* Quick Stats Bar */}
      <QuickStats summary={report.financialSummary} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1">
          <PersonalInfoCard person={report.person} />
        </div>

        {/* Right Column - Financial Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* CADIN Section - Premium Only */}
          {isPremium && report.cadin.length > 0 && (
            <CadinTimeline cadin={report.cadin} />
          )}

          {/* CCF Section - Premium Only */}
          {isPremium && report.ccf.length > 0 && (
            <CcfTimeline ccf={report.ccf} />
          )}

          {/* Debts Section */}
          {report.debts.length > 0 && (
            <DebtsTimeline debts={report.debts} />
          )}

          {/* Protests Section */}
          {report.protests.length > 0 && (
            <ProtestsTimeline protests={report.protests} />
          )}

          {/* Queries History */}
          {report.queries.length > 0 && (
            <QueriesHistory queries={report.queries} />
          )}

          {/* Empty State for CLEAR status */}
          {!isRestricted && report.debts.length === 0 && report.protests.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="relative overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-12 text-center"
            >
              <Shield className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                Situação Regular
              </h3>
              <p className="text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                Não foram encontradas pendências financeiras ou protestos registrados{isPremium ? " em nome deste documento" : " em nome deste CPF"}.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STATUS HERO SECTION
// ============================================================================

function StatusHero({ status, protocol }: { status: "RESTRICTED" | "CLEAR"; protocol: string }) {
  const isRestricted = status === "RESTRICTED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: isRestricted
          ? "linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)"
          : "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative px-8 py-12 md:px-16 md:py-16">
        <div className="max-w-4xl">
          {/* Status Icon with Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.8,
              type: "spring",
              stiffness: 200,
            }}
            className="mb-6"
          >
            {isRestricted ? (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 text-white shadow-2xl">
                <XCircle className="w-12 h-12" strokeWidth={2.5} />
              </div>
            ) : (
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-600 text-white shadow-2xl">
                <CheckCircle2 className="w-12 h-12" strokeWidth={2.5} />
              </div>
            )}
          </motion.div>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-3"
              style={{
                color: isRestricted ? "#991b1b" : "#065f46",
                lineHeight: "1.1",
              }}
            >
              {isRestricted ? "Restrição Encontrada" : "Nada Consta"}
            </h1>

            <p
              className="text-lg md:text-xl font-medium"
              style={{ color: isRestricted ? "#7f1d1d" : "#064e3b" }}
            >
              Status: <span className="font-bold uppercase tracking-wider">{status}</span>
            </p>
          </motion.div>

          {/* Protocol Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
            style={{
              backgroundColor: isRestricted
                ? "rgba(127, 29, 29, 0.15)"
                : "rgba(6, 78, 59, 0.15)",
              border: `1px solid ${isRestricted ? "rgba(153, 27, 27, 0.3)" : "rgba(6, 95, 70, 0.3)"}`,
            }}
          >
            <FileText className="w-4 h-4" style={{ color: isRestricted ? "#991b1b" : "#065f46" }} />
            <span
              className="text-sm font-semibold tracking-wide"
              style={{ color: isRestricted ? "#7f1d1d" : "#064e3b" }}
            >
              Protocolo: {protocol}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// QUICK STATS BAR
// ============================================================================

function QuickStats({ summary }: { summary: { totalDebts: number; totalProtests: number; totalQueries: number } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <StatCard
        icon={AlertTriangle}
        label="Dívidas"
        value={summary.totalDebts}
        color={summary.totalDebts > 0 ? "red" : "emerald"}
        delay={0.4}
      />
      <StatCard
        icon={FileText}
        label="Protestos"
        value={summary.totalProtests}
        color={summary.totalProtests > 0 ? "red" : "emerald"}
        delay={0.5}
      />
      <StatCard
        icon={Search}
        label="Consultas"
        value={summary.totalQueries}
        color="blue"
        delay={0.6}
      />
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "red" | "emerald" | "blue";
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const colorClasses = {
    red: {
      bg: "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
      border: "border-red-200 dark:border-red-800",
      icon: "text-red-600 dark:text-red-400",
      text: "text-red-900 dark:text-red-100",
    },
    emerald: {
      bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      icon: "text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-900 dark:text-emerald-100",
    },
    blue: {
      bg: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: "text-blue-600 dark:text-blue-400",
      text: "text-blue-900 dark:text-blue-100",
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
      className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 card-shadow group hover:scale-105 transition-transform duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors.icon} bg-white/50 dark:bg-black/20`}>
          <Icon className="w-6 h-6" strokeWidth={2.5} />
        </div>
      </div>

      <AnimatedNumber value={value} className={`text-5xl font-black tracking-tight ${colors.text} mb-1`} />

      <p className={`text-sm font-semibold uppercase tracking-wider ${colors.text} opacity-70`}>
        {label}
      </p>
    </motion.div>
  );
}

// ============================================================================
// PERSONAL INFO CARD
// ============================================================================

function PersonalInfoCard({ person }: { person: CreditReportResponse["person"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <User className="w-6 h-6 text-primary" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold">Informações Pessoais</h2>
        </div>

        <div className="space-y-4">
          <InfoItem icon={User} label="Nome" value={person.name} />
          <InfoItem icon={FileText} label="CPF" value={formatCpf(person.document)} />
          <InfoItem icon={Calendar} label="Nascimento" value={formatDate(person.birthDate)} />
          <InfoItem icon={User} label="Nome da Mãe" value={person.motherName} />
          <InfoItem icon={Mail} label="E-mail" value={person.email || "Não informado"} />
          <InfoItem icon={Building2} label="Atividade" value={person.mainEconomicActivity || "Não informado"} />
          <InfoItem icon={TrendingUp} label="Status" value={person.revenueStatus} />
        </div>
      </Card>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 group-hover:text-primary transition-colors" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

// ============================================================================
// DEBTS TIMELINE
// ============================================================================

function DebtsTimeline({ debts }: { debts: CreditReportResponse["debts"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-red-600 text-white">
            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100">Dívidas Registradas</h2>
            <p className="text-sm text-red-700 dark:text-red-300">{debts.length} {debts.length === 1 ? "pendência" : "pendências"} encontrada{debts.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {debts.map((debt, index) => (
            <DebtItem key={index} debt={debt} index={index} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function DebtItem({ debt, index }: { debt: CreditReportResponse["debts"][0]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
      className="relative pl-8 pb-6 border-l-2 border-red-300 dark:border-red-700 last:border-transparent last:pb-0"
    >
      {/* Timeline dot */}
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-red-600 ring-4 ring-red-50 dark:ring-red-950/50" />

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h4 className="font-bold text-red-900 dark:text-red-100 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
              {debt.origin}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Contrato: {debt.contract}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="destructive" className="text-lg font-bold px-3 py-1">
              {formatCurrency(debt.value)}
            </Badge>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
        >
          <ChevronDown className="w-4 h-4" />
          {isExpanded ? "Ocultar" : "Ver"} detalhes
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-red-900 dark:text-red-100">
              <strong>Vencimento:</strong> {formatDate(debt.date)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// PROTESTS TIMELINE
// ============================================================================

function ProtestsTimeline({ protests }: { protests: CreditReportResponse["protests"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-orange-600 text-white">
            <FileText className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100">Protestos</h2>
            <p className="text-sm text-orange-700 dark:text-orange-300">{protests.length} protesto{protests.length === 1 ? "" : "s"} registrado{protests.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {protests.map((protest, index) => (
            <ProtestItem key={index} protest={protest} index={index} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function ProtestItem({ protest, index }: { protest: CreditReportResponse["protests"][0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
      className="relative pl-8 pb-6 border-l-2 border-orange-300 dark:border-orange-700 last:border-transparent last:pb-0"
    >
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-orange-600 ring-4 ring-orange-50 dark:ring-orange-950/50" />

      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h4 className="font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {protest.notary}
          </h4>
        </div>
        <Badge variant="destructive" className="text-lg font-bold px-3 py-1 bg-orange-600">
          {formatCurrency(protest.value)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-400 mt-2">
        <Calendar className="w-4 h-4" />
        <span>{formatDate(protest.date)}</span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// CADIN TIMELINE (Federal Debt Registry)
// ============================================================================

function CadinTimeline({ cadin }: { cadin: PremiumCreditReportResponse["cadin"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-violet-50/50 dark:from-purple-950/20 dark:to-violet-950/20 p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-600 text-white">
            <Landmark className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100">Restrição Federal (CADIN)</h2>
            <p className="text-sm text-purple-700 dark:text-purple-300">{cadin.length} registro{cadin.length === 1 ? "" : "s"} encontrado{cadin.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {cadin.map((item, index) => (
            <CadinItem key={index} item={item} index={index} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function CadinItem({ item, index }: { item: PremiumCreditReportResponse["cadin"][0]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
      className="relative pl-8 pb-6 border-l-2 border-purple-300 dark:border-purple-700 last:border-transparent last:pb-0"
    >
      {/* Timeline dot */}
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-purple-600 ring-4 ring-purple-50 dark:ring-purple-950/50" />

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left group"
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex-1">
            <h4 className="font-bold text-purple-900 dark:text-purple-100 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
              {item.literal}
            </h4>
          </div>
          <div className="text-right">
            <Badge variant="destructive" className="text-lg font-bold px-3 py-1 bg-purple-600">
              {formatCurrency(item.value)}
            </Badge>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="inline-flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400"
        >
          <ChevronDown className="w-4 h-4" />
          {isExpanded ? "Ocultar" : "Ver"} detalhes
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="mt-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-900 dark:text-purple-100">
              <strong>Data de Registro:</strong> {formatDate(item.date)}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// CCF TIMELINE (Bad Checks)
// ============================================================================

function CcfTimeline({ ccf }: { ccf: PremiumCreditReportResponse["ccf"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-600 text-white">
            <FileX className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">Cheques sem Fundo (CCF)</h2>
            <p className="text-sm text-amber-700 dark:text-amber-300">{ccf.length} registro{ccf.length === 1 ? "" : "s"} encontrado{ccf.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="space-y-4">
          {ccf.map((item, index) => (
            <CcfItem key={index} item={item} index={index} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function CcfItem({ item, index }: { item: PremiumCreditReportResponse["ccf"][0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.65 + index * 0.1, duration: 0.4 }}
      className="relative pl-8 pb-6 border-l-2 border-amber-300 dark:border-amber-700 last:border-transparent last:pb-0"
    >
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-amber-600 ring-4 ring-amber-50 dark:ring-amber-950/50" />

      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h4 className="font-bold text-amber-900 dark:text-amber-100 flex items-center gap-2">
            <FileX className="w-4 h-4" />
            {item.origin}
          </h4>
          <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            Quantidade: <strong>{item.quantity}</strong> cheque{item.quantity === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 mt-2">
        <Calendar className="w-4 h-4" />
        <span>Último registro: {item.date || "Data não disponível"}</span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// QUERIES HISTORY
// ============================================================================

function QueriesHistory({ queries }: { queries: CreditReportResponse["queries"] }) {
  const [showAll, setShowAll] = useState(false);
  const displayedQueries = showAll ? queries : queries.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6 }}
    >
      <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm p-6 card-shadow">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-600 text-white">
            <Clock className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Histórico de Consultas</h2>
            <p className="text-sm text-muted-foreground">{queries.length} consulta{queries.length === 1 ? "" : "s"} realizada{queries.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        <div className="space-y-3">
          {displayedQueries.map((query, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.05, duration: 0.3 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{query.entity}</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(query.date)}</span>
            </motion.div>
          ))}
        </div>

        {queries.length > 5 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="mt-4 w-full py-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {showAll ? "Ver menos" : `Ver todas (${queries.length})`}
          </button>
        )}
      </Card>
    </motion.div>
  );
}

// ============================================================================
// ANIMATED NUMBER COMPONENT
// ============================================================================

function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 2000 });
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.round(latest).toString();
      }
    });

    return () => unsubscribe();
  }, [springValue]);

  return <span ref={ref} className={className}>0</span>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function formatDate(dateString: string): string {
  try {
    // Check if date is in Brazilian format dd/MM/yyyy
    if (dateString.includes("/")) {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const [day, month, year] = parts;
        // Create date in ISO format (yyyy-MM-dd) which JS understands
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        const date = new Date(isoDate);

        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }
      }
    }

    // Fallback: try to parse as ISO date
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    // If all fails, return original string
    return dateString;
  } catch {
    return dateString;
  }
}

function formatCurrency(value: string): string {
  try {
    // Check if value is in Brazilian format (e.g., "8.143,84")
    // Convert to US format for parsing: remove dots, replace comma with dot
    let cleanValue = value;

    if (value.includes(",")) {
      // Brazilian format: "8.143,84" → "8143.84"
      cleanValue = value.replace(/\./g, "").replace(",", ".");
    }

    const numValue = parseFloat(cleanValue);

    if (isNaN(numValue)) {
      return value;
    }

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numValue);
  } catch {
    return value;
  }
}
