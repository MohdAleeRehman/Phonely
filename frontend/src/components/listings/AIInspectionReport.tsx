import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { inspectionService } from '../../services/inspection.service';
import type { Inspection } from '../../types';
import Loading from '../common/Loading';

interface AIInspectionReportProps {
  inspectionId: string;
  listingPrice: number;
}

export default function AIInspectionReport({ inspectionId, listingPrice }: AIInspectionReportProps) {
  const [expanded, setExpanded] = useState(true);

  const { data: inspection, isLoading, error } = useQuery<Inspection>({
    queryKey: ['inspection', inspectionId],
    queryFn: () => inspectionService.getInspectionReport(inspectionId),
    enabled: !!inspectionId,
  });

  if (isLoading) {
    return (
      <div className="card bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200">
        <div className="flex items-center justify-center py-8">
          <Loading size="md" />
          <span className="ml-3 text-gray-600">Loading AI Inspection Report...</span>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return null;
  }

  const getConditionColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getConditionText = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Fair';
    return 'Poor';
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '🔴';
      case 'moderate':
        return '🟠';
      case 'minor':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const conditionScore = inspection.visionAnalysis?.conditionScore || 0;
  const authenticityScore = inspection.visionAnalysis?.authenticityScore || 0;
  const detectedIssues = inspection.visionAnalysis?.detectedIssues || [];

  // Categorize issues by severity
  const criticalIssues = detectedIssues.filter(i => i.severity.toLowerCase() === 'critical');
  const moderateIssues = detectedIssues.filter(i => i.severity.toLowerCase() === 'moderate');
  const minorIssues = detectedIssues.filter(i => i.severity.toLowerCase() === 'minor');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card bg-linear-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <span className="bg-linear-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            AI Inspection Report
          </span>
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2"
        >
          {expanded ? '🔼 Collapse' : '🔽 Expand'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6">
          {/* Overall Condition Score */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Overall Condition Score</p>
                <p className="text-5xl font-black text-gray-900">{conditionScore}/10</p>
                <p className={`text-lg font-bold mt-2 ${
                  conditionScore >= 8 ? 'text-green-600' :
                  conditionScore >= 6 ? 'text-yellow-600' :
                  conditionScore >= 4 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {getConditionText(conditionScore)} Condition
                </p>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                conditionScore >= 8 ? 'bg-green-100' :
                conditionScore >= 6 ? 'bg-yellow-100' :
                conditionScore >= 4 ? 'bg-orange-100' : 'bg-red-100'
              }`}>
                <span className="text-3xl">
                  {conditionScore >= 8 ? '✅' :
                   conditionScore >= 6 ? '👍' :
                   conditionScore >= 4 ? '⚠️' : '❌'}
                </span>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(conditionScore / 10) * 100}%` }}
                transition={{ delay: 0.3, duration: 1 }}
                className={`h-full ${getConditionColor(conditionScore)}`}
              />
            </div>
          </div>

          {/* Authenticity Score */}
          <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1 flex items-center gap-2">
                  <span>🔒</span> Authenticity Score
                </p>
                <p className={`text-4xl font-black ${getAuthenticityColor(authenticityScore)}`}>
                  {authenticityScore}%
                </p>
              </div>
              <div className="text-right">
                {authenticityScore >= 90 && (
                  <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                    ✅ Genuine
                  </div>
                )}
                {authenticityScore >= 70 && authenticityScore < 90 && (
                  <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-bold">
                    ⚠️ Likely Genuine
                  </div>
                )}
                {authenticityScore < 70 && (
                  <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold">
                    ❌ Verification Needed
                  </div>
                )}
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${authenticityScore}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className={`h-full ${
                  authenticityScore >= 90 ? 'bg-green-500' :
                  authenticityScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Our AI analyzes device branding, packaging, and physical characteristics to verify authenticity.
            </p>
          </div>

          {/* Detected Issues by Severity */}
          {detectedIssues.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>🔍</span> Detected Issues ({detectedIssues.length})
              </h3>

              {/* Critical Issues */}
              {criticalIssues.length > 0 && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                  <p className="font-bold text-red-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🔴</span> Critical Issues ({criticalIssues.length})
                  </p>
                  <div className="space-y-2">
                    {criticalIssues.map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-red-200 flex items-start gap-3">
                        <span className="text-red-600 text-lg mt-0.5">{getSeverityIcon(issue.severity)}</span>
                        <div>
                          <p className="font-bold text-red-800 capitalize">{issue.type.replace(/-/g, ' ')}</p>
                          <p className="text-sm text-gray-600 mt-1">Requires immediate attention</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderate Issues */}
              {moderateIssues.length > 0 && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
                  <p className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🟠</span> Moderate Issues ({moderateIssues.length})
                  </p>
                  <div className="space-y-2">
                    {moderateIssues.map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-orange-200 flex items-start gap-3">
                        <span className="text-orange-600 text-lg mt-0.5">{getSeverityIcon(issue.severity)}</span>
                        <div>
                          <p className="font-bold text-orange-800 capitalize">{issue.type.replace(/-/g, ' ')}</p>
                          <p className="text-sm text-gray-600 mt-1">May affect functionality</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minor Issues */}
              {minorIssues.length > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
                  <p className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🟡</span> Minor Issues ({minorIssues.length})
                  </p>
                  <div className="space-y-2">
                    {minorIssues.map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border-2 border-yellow-200 flex items-start gap-3">
                        <span className="text-yellow-600 text-lg mt-0.5">{getSeverityIcon(issue.severity)}</span>
                        <div>
                          <p className="font-bold text-yellow-800 capitalize">{issue.type.replace(/-/g, ' ')}</p>
                          <p className="text-sm text-gray-600 mt-1">Cosmetic or minor wear</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pricing Analysis */}
          {inspection.pricingAnalysis && (
            <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💰</span> Pricing Analysis
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">AI Min Price</p>
                    <p className="text-xl font-bold text-blue-600">
                      PKR {inspection.pricingAnalysis.suggestedMinPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Market Average</p>
                    <p className="text-xl font-bold text-purple-600">
                      PKR {inspection.pricingAnalysis.marketAverage.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">AI Max Price</p>
                    <p className="text-xl font-bold text-green-600">
                      PKR {inspection.pricingAnalysis.suggestedMaxPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Current Listing Price</p>
                      <p className="text-2xl font-bold text-gray-900">PKR {listingPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      {listingPrice < inspection.pricingAnalysis.suggestedMinPrice && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold">
                          🔥 Great Deal!
                        </div>
                      )}
                      {listingPrice >= inspection.pricingAnalysis.suggestedMinPrice && 
                       listingPrice <= inspection.pricingAnalysis.suggestedMaxPrice && (
                        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                          ✅ Fair Price
                        </div>
                      )}
                      {listingPrice > inspection.pricingAnalysis.suggestedMaxPrice && (
                        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold">
                          ⚠️ Above Market
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📊</span>
                  <span>Confidence Level: <span className="font-bold capitalize">{inspection.pricingAnalysis.confidenceLevel}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Text Analysis */}
          {inspection.textAnalysis && (
            <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📝</span> Description Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Quality</p>
                  <p className="text-lg font-bold text-purple-600 capitalize">
                    {inspection.textAnalysis.descriptionQuality}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Completeness</p>
                  <p className="text-lg font-bold text-blue-600">
                    {inspection.textAnalysis.completeness}%
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200 col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Consistency Check</p>
                  <p className={`text-lg font-bold ${inspection.textAnalysis.consistency ? 'text-green-600' : 'text-red-600'}`}>
                    {inspection.textAnalysis.consistency ? '✅ Consistent' : '❌ Inconsistencies Found'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="bg-linear-to-r from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <span>Report generated by Phonely AI</span>
              </div>
              <div>
                {inspection.createdAt && (
                  <span>
                    {new Date(inspection.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
