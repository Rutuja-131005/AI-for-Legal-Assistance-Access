import React, { useState, useEffect } from 'react';
import { Activity, X, Zap, Cpu, DollarSign, Database, CheckCircle2 } from 'lucide-react';

export const MetricsDashboardModal = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/metrics')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMetrics(data.metrics);
          }
        })
        .catch(err => console.error('Failed to fetch system metrics:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="metrics-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 id="metrics-modal-title" className="font-serif text-lg font-bold text-stone-900">
              System Observability & Operational Metrics
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !metrics ? (
          <div className="py-12 text-center text-xs text-stone-500">
            Fetching metrics telemetry...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-stone-500" /> Docs Processed
                </span>
                <span className="text-xl font-bold font-mono text-stone-900 block mt-1">
                  {metrics.documentsProcessed}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Avg Latency
                </span>
                <span className="text-xl font-bold font-mono text-stone-900 block mt-1">
                  {metrics.averageProcessingTimeMs} ms
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <Database className="w-3 h-3 text-blue-500" /> Cache Hit Rate
                </span>
                <span className="text-xl font-bold font-mono text-stone-900 block mt-1">
                  {metrics.cacheHitRatePct}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-500" /> Est. Cost
                </span>
                <span className="text-xl font-bold font-mono text-stone-900 block mt-1">
                  ${metrics.estimatedCostUsd}
                </span>
              </div>
            </div>

            {/* Confidence Distribution */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>RAG Evidence Confidence Distribution</span>
              </span>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-100/70 border border-emerald-200 text-emerald-900">
                  <span className="font-bold block">HIGH</span>
                  <span className="font-mono text-sm">{metrics.confidenceDistribution.HIGH} queries</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-900">
                  <span className="font-bold block">MEDIUM</span>
                  <span className="font-mono text-sm">{metrics.confidenceDistribution.MEDIUM} queries</span>
                </div>
                <div className="p-2 rounded-lg bg-red-100/70 border border-red-200 text-red-900">
                  <span className="font-bold block">LOW / Refused</span>
                  <span className="font-mono text-sm">{metrics.confidenceDistribution.LOW} queries</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-500 text-center border-t border-stone-100 pt-3">
              Server Uptime: {metrics.uptimeSeconds}s | Last Metrics Sync: {new Date(metrics.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
