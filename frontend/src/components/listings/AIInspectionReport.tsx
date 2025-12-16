import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ThumbsUp, AlertTriangle, X, Lock, Search, FileText, BarChart3, Sparkles, AlertCircle, CircleDot, Bot, ChevronUp, Eye } from 'lucide-react';
import PKRIcon from '../icons/PKRIcon';
import { inspectionService } from '../../services/inspection.service';
import type { Inspection } from '../../types';
import Loading from '../common/Loading';

interface AIInspectionReportProps {
  inspectionId: string;
  listingPrice: number;
}

export default function AIInspectionReport({ inspectionId, listingPrice }: AIInspectionReportProps) {
  const [expanded, setExpanded] = useState(false);

  const { data: inspection, isLoading, error } = useQuery<Inspection>({
    queryKey: ['inspection', inspectionId],
    queryFn: () => inspectionService.getInspectionReport(inspectionId),
    enabled: !!inspectionId,
  });

  if (isLoading) {
    return (
      <div className="card bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <Loading size="md" />
          <span className="ml-3 text-gray-300">Loading AI Inspection Report...</span>
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
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <CircleDot className="w-4 h-4 text-red-400" />;
      case 'moderate':
        return <CircleDot className="w-4 h-4 text-orange-400" />;
      case 'minor':
        return <CircleDot className="w-4 h-4 text-yellow-400" />;
      default:
        return <CircleDot className="w-4 h-4 text-gray-400" />;
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
      className="card bg-linear-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 shadow-lg backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Bot className="w-8 h-8 text-cyan-400" />
          <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            AI Inspection Report
          </span>
        </h2>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 flex items-center gap-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Collapse Report
            </>
          ) : (
            <>
              <Eye className="w-5 h-5" />
              View Full Report
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="space-y-6">
          {/* Overall Condition Score */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 border-green-500/50 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1">Overall Condition Score</p>
                <p className="text-5xl font-black text-white">{conditionScore}/10</p>
                <p className={`text-lg font-bold mt-2 ${
                  conditionScore >= 8 ? 'text-green-400' :
                  conditionScore >= 6 ? 'text-yellow-400' :
                  conditionScore >= 4 ? 'text-orange-400' : 'text-red-400'
                }`}>
                  {getConditionText(conditionScore)} Condition
                </p>
              </div>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                conditionScore >= 8 ? 'bg-green-500/20' :
                conditionScore >= 6 ? 'bg-yellow-500/20' :
                conditionScore >= 4 ? 'bg-orange-500/20' : 'bg-red-500/20'
              }`}>
                {conditionScore >= 8 ? (
                  <CheckCircle2 className="w-8 h-8 text-green-400" />
                ) : conditionScore >= 6 ? (
                  <ThumbsUp className="w-8 h-8 text-yellow-400" />
                ) : conditionScore >= 4 ? (
                  <AlertTriangle className="w-8 h-8 text-orange-400" />
                ) : (
                  <X className="w-8 h-8 text-red-400" />
                )}
              </div>
            </div>
            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(conditionScore / 10) * 100}%` }}
                transition={{ delay: 0.3, duration: 1 }}
                className={`h-full ${getConditionColor(conditionScore)}`}
              />
            </div>
          </div>

          {/* Authenticity Score */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 border-green-500/50 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Authenticity Score
                </p>
                <p className={`text-4xl font-black ${getAuthenticityColor(authenticityScore)}`}>
                  {authenticityScore}%
                </p>
              </div>
              <div className="text-right">
                {authenticityScore >= 90 && (
                  <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-green-500/50">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    Genuine
                  </div>
                )}
                {authenticityScore >= 70 && authenticityScore < 90 && (
                  <div className="bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-yellow-500/50">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Likely Genuine
                  </div>
                )}
                {authenticityScore < 70 && (
                  <div className="bg-red-500/20 text-red-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-red-500/50">
                    <X className="w-4 h-4 inline mr-1" />
                    Verification Needed
                  </div>
                )}
              </div>
            </div>
            <div className="h-4 bg-gray-700/50 rounded-full overflow-hidden">
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
            <p className="text-xs text-gray-400 mt-3">
              Our AI analyzes device branding, packaging, and physical characteristics to verify authenticity.
            </p>
          </div>

          {/* Detected Issues by Severity */}
          {detectedIssues.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-cyan-400" />
                Detected Issues ({detectedIssues.length})
              </h3>

              {/* Critical Issues */}
              {criticalIssues.length > 0 && (
                <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="font-bold text-red-300 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    Critical Issues ({criticalIssues.length})
                  </p>
                  <div className="space-y-2">
                    {criticalIssues.map((issue, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-red-500/50 flex items-start gap-3">
                        <span className="text-red-400 text-lg mt-0.5 shrink-0">{getSeverityIcon(issue.severity)}</span>
                        <div className="flex-1">
                          <p className="font-bold text-red-300 capitalize mb-1">
                            {('location' in issue ? (issue as { location?: string }).location : null) || issue.type.replace(/-/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-300">Requires immediate attention</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Moderate Issues */}
              {moderateIssues.length > 0 && (
                <div className="bg-orange-500/20 border-2 border-orange-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="font-bold text-orange-300 mb-3 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-orange-400" /> Moderate Issues ({moderateIssues.length})
                  </p>
                  <div className="space-y-2">
                    {moderateIssues.map((issue, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-orange-500/50 flex items-start gap-3">
                        <span className="text-orange-400 text-lg mt-0.5 shrink-0">{getSeverityIcon(issue.severity)}</span>
                        <div className="flex-1">
                          <p className="font-bold text-orange-300 capitalize mb-1">
                            {('location' in issue ? (issue as { location?: string }).location : null) || issue.type.replace(/-/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-300">May affect functionality</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minor Issues */}
              {minorIssues.length > 0 && (
                <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-xl p-4 backdrop-blur-sm">
                  <p className="font-bold text-yellow-300 mb-3 flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-yellow-400" /> Minor Issues ({minorIssues.length})
                  </p>
                  <div className="space-y-2">
                    {minorIssues.map((issue, index) => (
                      <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-3 border-2 border-yellow-500/50 flex items-start gap-3">
                        <span className="text-yellow-400 text-lg mt-0.5 shrink-0">{getSeverityIcon(issue.severity)}</span>
                        <div className="flex-1">
                          <p className="font-bold text-yellow-300 capitalize mb-1">
                            {('location' in issue ? (issue as { location?: string }).location : null) || issue.type.replace(/-/g, ' ')}
                          </p>
                          <p className="text-sm text-gray-300">Cosmetic or minor wear</p>
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
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-500/50 shadow-md">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <PKRIcon className="w-5 h-5 text-cyan-400" />
                Pricing Analysis
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-500/20 rounded-lg border border-blue-500/50 backdrop-blur-sm">
                    <p className="text-sm text-gray-300 mb-1">AI Min Price</p>
                    <p className="text-xl font-bold text-blue-400">
                      PKR {inspection.pricingAnalysis.suggestedMinPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-500/20 rounded-lg border border-purple-500/50 backdrop-blur-sm">
                    <p className="text-sm text-gray-300 mb-1">Market Average</p>
                    <p className="text-xl font-bold text-purple-400">
                      PKR {inspection.pricingAnalysis.marketAverage.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500/50 backdrop-blur-sm">
                    <p className="text-sm text-gray-300 mb-1">AI Max Price</p>
                    <p className="text-xl font-bold text-green-400">
                      PKR {inspection.pricingAnalysis.suggestedMaxPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Current Listing Price</p>
                      <p className="text-2xl font-bold text-white">PKR {listingPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      {listingPrice < inspection.pricingAnalysis.suggestedMinPrice && (
                        <div className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-green-500/50 flex items-center">
                          <Sparkles className="w-4 h-4 mr-1" />
                          Great Deal!
                        </div>
                      )}
                      {listingPrice >= inspection.pricingAnalysis.suggestedMinPrice && 
                       listingPrice <= inspection.pricingAnalysis.suggestedMaxPrice && (
                        <div className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-blue-500/50 flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Fair Price
                        </div>
                      )}
                      {listingPrice > inspection.pricingAnalysis.suggestedMaxPrice && (
                        <div className="bg-orange-500/20 text-orange-300 px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm border border-orange-500/50 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Above Market
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <BarChart3 className="w-4 h-4" />
                  <span>Confidence Level: <span className="font-bold capitalize">{inspection.pricingAnalysis.confidenceLevel}</span></span>
                </div>
              </div>
            </div>
          )}

          {/* Text Analysis */}
          {inspection.textAnalysis && (
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border-2 border-purple-500/50">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Description Analysis
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/50 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 mb-1">Quality</p>
                  <p className="text-lg font-bold text-purple-400 capitalize">
                    {inspection.textAnalysis.descriptionQuality}
                  </p>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/50 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 mb-1">Completeness</p>
                  <p className="text-lg font-bold text-blue-400">
                    {inspection.textAnalysis.completeness}%
                  </p>
                </div>
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/50 col-span-2 backdrop-blur-sm">
                  <p className="text-sm text-gray-300 mb-1">Consistency Check</p>
                  <p className={`text-lg font-bold ${inspection.textAnalysis.consistency ? 'text-green-400' : 'text-red-400'}`}>
                    <span className="flex items-center gap-2">
                      {inspection.textAnalysis.consistency ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Consistent
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 text-red-400" />
                          Inconsistencies Found
                        </>
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Report Footer */}
          <div className="bg-linear-to-r from-green-500/20 to-teal-500/20 rounded-xl p-4 border border-green-500/50 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-cyan-400" />
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
