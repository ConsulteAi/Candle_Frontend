'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Info } from 'lucide-react';
import { Card } from '@/design-system/ComponentsTailwind';

interface Alert {
  title: string;
  description: string;
}

interface AlertsGridProps {
  alerts: Alert[];
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AlertsGrid({ alerts }: AlertsGridProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <motion.div variants={item}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Insights e Comportamento
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert, idx) => (
          <AlertCard key={idx} alert={alert} />
        ))}
      </div>
    </motion.div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const { title, description } = alert;

  // Check if description is structured (contains both ":" and "/")
  // Example: "DATA:19/11/2025/QUANTIDADE:1/SEGMENTO:O"
  const isStructured = description.includes(':') && description.includes('/');

  // Split only when a slash starts the next KEY:VALUE token (keeps date slashes intact)
  const parseStructuredData = (desc: string) => {
    return desc
    .split(/\/(?=[A-Z0-9_ ]+:)/)
    .map(part => {
      const [key, ...values] = part.split(':');
      if (!key || values.length === 0) return null;
      return { key: key.trim(), value: values.join(':').trim() };
    })
    .filter(Boolean);
  };

  const structuredData = isStructured ? parseStructuredData(description) : null;

  return (
    <Card className="h-full border border-yellow-100 bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-md transition-all duration-300">
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start gap-2 mb-3">
           <Info className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wider leading-relaxed">
             {title}
           </p>
        </div>
        
        <div className="mt-auto">
          {structuredData ? (
            <div className="space-y-2 bg-white/50 rounded-lg p-2 border border-yellow-100/50">
              {structuredData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium text-[10px] uppercase tracking-wide">{item?.key}</span>
                  <span className="text-gray-900 font-bold ml-2 text-right">{item?.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-semibold text-gray-800 text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
