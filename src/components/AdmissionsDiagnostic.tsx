import React, { useState } from 'react';
import { StudentProfile, DiagnosisReport } from '../types/admission';
import { saveServerDiagnostic } from '../services/backendStorage';
import {
  Sparkles,
  Award,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
  MessageSquare,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface Props {
  profile: StudentProfile;
  onOpenProfile: () => void;
  onConsultWithDiagnostic: (prompt: string) => void;
}

export const AdmissionsDiagnostic: React.FC<Props> = ({
  profile,
  onOpenProfile,
  onConsultWithDiagnostic,
}) => {
  const [report, setReport] = useState<DiagnosisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunDiagnosis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        throw new Error('진단 리포트 생성 중 오류가 발생했습니다.');
      }

      const data: DiagnosisReport = await response.json();
      setReport(data);
      await saveServerDiagnostic(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '진단 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    if (verdict.includes('안정')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (verdict.includes('적정')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (verdict.includes('소신') || verdict.includes('상향')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {profile.grade} · {profile.track}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs font-semibold text-slate-600">
              희망: {profile.targetMajor || '자율전공'} ({profile.targetUniversities || '주요 대학'})
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            내신 <span className="text-blue-600">{profile.gpa || '-'}등급</span> & 모의평가{' '}
            <span className="text-emerald-600">
              {profile.mockKorean || '-'}/{profile.mockMath || '-'}/{profile.mockEnglish || '-'}/{profile.mockInquiry || '-'}
            </span>{' '}
            종합 진단
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            내신 성적과 모의고사 등급의 유불리를 계산하여 최적의 수시 6장 & 정시 조합을 진단합니다.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={onOpenProfile}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            성적 수정
          </button>
          <button
            onClick={handleRunDiagnosis}
            disabled={isLoading}
            className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>정밀 진단 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{report ? '리포트 다시 생성' : 'AI 정밀 진단 시작'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* When no report yet */}
      {!report && !isLoading && (
        <div className="bg-white rounded-2xl p-12 border border-dashed border-slate-300 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-800">
              AI 입시 정밀 진단 리포트를 받아보세요
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              입력하신 내신 등급, 모의고사 성적, 목표 학과 데이터를 바탕으로 수시 vs 정시 적합도 점수, 추천 전형 및 목표 대학별 합격 가능성을 정밀 진단합니다.
            </p>
          </div>
          <button
            onClick={handleRunDiagnosis}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>내 프로필 기반 무료 진단받기</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 rounded-xl"></div>
            <div className="h-32 bg-slate-100 rounded-xl"></div>
          </div>
          <div className="h-40 bg-slate-100 rounded-xl"></div>
        </div>
      )}

      {/* Report Content */}
      {report && (
        <div className="space-y-6">
          {/* Strategy Summary & Fit Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Total Summary */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 mb-3">
                  AI 총괄 입시 전략 평가
                </span>
                <h3 className="text-lg font-bold text-white leading-snug">
                  "{report.strategySummary}"
                </h3>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-300 block">메인 추천 전형</span>
                  <span className="text-sm font-bold text-white">{report.recommendedTrack}</span>
                </div>
                <button
                  onClick={() =>
                    onConsultWithDiagnostic(
                      `방금 AI 대입 정밀진단을 받았습니다. 총평은 "${report.strategySummary}"이고 추천 전형은 "${report.recommendedTrack}"입니다. 제 내신 ${profile.gpa}등급과 모의고사 성적을 바탕으로 수시 6장 구체적 지원 전략을 더 자세히 상담받고 싶습니다.`
                    )
                  }
                  className="px-3.5 py-2 rounded-xl bg-white text-indigo-950 text-xs font-bold hover:bg-indigo-50 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  <span>컨설턴트와 심층 상담</span>
                </button>
              </div>
            </div>

            {/* Susi vs Jeongsi Ratio Gauges */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <h4 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                수시 vs 정시 적합도 지수
              </h4>

              <div className="space-y-4">
                {/* Susi bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-blue-700">수시 전형 적합도</span>
                    <span className="text-blue-700 font-bold">{report.susiFitScore}점</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, report.susiFitScore))}%` }}
                    />
                  </div>
                </div>

                {/* Jeongsi bar */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-emerald-700">정시 전형 적합도</span>
                    <span className="text-emerald-700 font-bold">{report.jeongsiFitScore}점</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(100, Math.max(0, report.jeongsiFitScore))}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                {report.susiFitScore >= report.jeongsiFitScore
                  ? '💡 수시 집중형: 학생부 및 수능최저 관리가 가장 효율적입니다.'
                  : '💡 정시 집중형 또는 수시 상향 + 정시 안정 전략이 권장됩니다.'}
              </div>
            </div>
          </div>

          {/* Target Universities Verdicts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              목표 대학별 합격선 및 전형 진단
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.targetEvaluations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-4.5 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-slate-900 text-sm">{item.universityName}</span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getVerdictBadge(
                          item.verdict
                        )}`}
                      >
                        {item.verdict}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-indigo-700 mb-2">
                      {item.majorName} · {item.admissionType}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.analysis}</p>
                  </div>
                  <button
                    onClick={() =>
                      onConsultWithDiagnostic(
                        `${item.universityName} ${item.majorName} (${item.admissionType}) 전형이 진단 결과 "${item.verdict}"으로 나왔습니다. 합격 확률을 높이기 위한 구체적인 준비 방법을 알려주세요.`
                      )
                    }
                    className="mt-3 text-[11px] text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 self-start"
                  >
                    <span>이 대학 합격 전략 질문</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Strengths */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                나의 입시 핵심 강점 (Key Strengths)
              </h4>
              <ul className="space-y-2.5">
                {report.keyStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed mt-0.5">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses & Solutions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                보완점 및 실전 솔루션 (Action Solutions)
              </h4>
              <ul className="space-y-3">
                {report.weaknessesAndSolutions.map((item, idx) => (
                  <li key={idx} className="text-xs space-y-1">
                    <div className="font-semibold text-rose-700 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      {item.weakness}
                    </div>
                    <div className="text-slate-600 pl-3 border-l-2 border-slate-200 leading-relaxed">
                      💡 {item.solution}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              시기별 실천 로드맵 (Action Timeline)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {report.actionTimeline.map((item, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                    {item.phase}
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {item.actionItem}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
