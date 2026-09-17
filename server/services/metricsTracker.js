/**
 * ClariLex Observability & Performance Metrics Tracker
 * Records system operational metrics, retrieval latency, cache hit rates, and confidence distributions.
 */

const metrics = {
  documentsProcessed: 0,
  totalProcessingTimeMs: 0,
  averageProcessingTimeMs: 0,
  totalQueries: 0,
  totalQueryLatencyMs: 0,
  averageQueryLatencyMs: 0,
  cacheHits: 0,
  cacheMisses: 0,
  cacheHitRatePct: 0,
  estimatedTokenCount: 0,
  estimatedCostUsd: 0,
  confidenceDistribution: {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  },
  failedQueries: 0,
  insufficientEvidenceResponses: 0,
  startTime: new Date().toISOString(),
};

export function recordDocumentProcessing(durationMs, wordCount = 0) {
  metrics.documentsProcessed += 1;
  metrics.totalProcessingTimeMs += durationMs;
  metrics.averageProcessingTimeMs = Math.round(metrics.totalProcessingTimeMs / metrics.documentsProcessed);
  metrics.estimatedTokenCount += Math.round(wordCount * 1.33);
}

export function recordQueryExecution(durationMs, confidence = 'HIGH', isCacheHit = false, isGrounded = true) {
  metrics.totalQueries += 1;
  metrics.totalQueryLatencyMs += durationMs;
  metrics.averageQueryLatencyMs = Math.round(metrics.totalQueryLatencyMs / metrics.totalQueries);

  if (isCacheHit) {
    metrics.cacheHits += 1;
  } else {
    metrics.cacheMisses += 1;
  }

  const totalCacheRequests = metrics.cacheHits + metrics.cacheMisses;
  metrics.cacheHitRatePct = Number(((metrics.cacheHits / totalCacheRequests) * 100).toFixed(1));

  if (metrics.confidenceDistribution[confidence] !== undefined) {
    metrics.confidenceDistribution[confidence] += 1;
  }

  if (!isGrounded) {
    metrics.insufficientEvidenceResponses += 1;
  }

  metrics.estimatedCostUsd = Number(((metrics.estimatedTokenCount / 1000) * 0.00015).toFixed(5));
}

export function recordQueryFailure() {
  metrics.failedQueries += 1;
}

export function getSystemMetrics() {
  return {
    ...metrics,
    uptimeSeconds: Math.round((Date.now() - new Date(metrics.startTime).getTime()) / 1000),
    timestamp: new Date().toISOString(),
  };
}
