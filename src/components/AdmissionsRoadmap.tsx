import React, { useState } from 'react';
import { StudentProfile } from '../types/admission';
import { UNIVERSITIES_DATA, ADMISSION_MILESTONES } from '../data/admissionsData';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  GraduationCap,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';

interface Props {
  profile: StudentProfile;
  onAskAboutUniversity: (query: string) => void;
}

export const AdmissionsRoadmap: React.FC<Props> = ({ profile, onAskAboutUniversity }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [susiStrategy, setSusiStrategy] = useState({
    upward: 2, // 상향
    moderate: 2, // 적정
    stable: 2, // 안정
  });

  // Calculate D-day for 2027 Suneung (Nov 19, 2026)
  const calculateDday = (targetDateStr: string) => {
    const today = new Date();
    // Default to Nov 19, 2026 for Suneung 2027
    const target = new Date('2026-11-19T00:00:00');
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `D-${days}` : 'D-Day';
  };

  const suneungDday = calculateDday('2026-11-19');

  // Filter universities
  const filteredUniversities = UNIVERSITIES_DATA.filter((univ) => {
    const matchesSearch =
      univ.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      univ.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion =
      selectedRegion === 'all' ? true : univ.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const totalCards = susiStrategy.upward + susiStrategy.moderate + susiStrategy.stable;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner: D-Day & Milestone Calendar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-400 block tracking-wide">
                2027학년도 대입 카운트다운
              </span>
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                대학수학능력시험 <span className="text-rose-400">{suneungDday}</span>
              </h2>
            </div>
          </div>
          <div className="text-xs text-slate-300 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="font-semibold text-white block mb-0.5">수능 본고사 예정일:</span>
            <span>2026년 11월 19일 (목)</span>
          </div>
        </div>

        {/* Milestone Schedule Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ADMISSION_MILESTONES.slice(1, 5).map((m, idx) => (
            <div
              key={idx}
              className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-indigo-300">{m.dDayText}</span>
                <span className="text-slate-400">{m.category}</span>
              </div>
              <div className="font-bold text-white text-xs leading-snug">{m.title}</div>
              <div className="text-[11px] text-slate-400">{m.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Susi 6 Cards Portfolio Simulator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              수시 6장 지원 카드 포트폴리오 시뮬레이터
            </h3>
            <p className="text-xs text-slate-500">
              수시 모집은 최대 6회 지원 가능합니다. (KAIST, UNIST 등 특수목적대는 6회 제한 미포함)
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold">
            <span className="text-slate-500">배분 총 카드:</span>
            <span
              className={`px-2 py-0.5 rounded-md ${
                totalCards === 6
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {totalCards} / 6장
            </span>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Upward (상향) */}
          <div className="bg-amber-50/60 border border-amber-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>상향 / 소신 지원</span>
              <span className="text-sm bg-white px-2 py-0.5 rounded-md border border-amber-200">
                {susiStrategy.upward}장
              </span>
            </div>
            <p className="text-[11px] text-amber-700 leading-tight">
              합격선보다 내신이 약간 부족하나 학종 역량이나 수능최저로 역전을 노리는 대학
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSusiStrategy({ ...susiStrategy, upward: Math.max(0, susiStrategy.upward - 1) })
                }
                className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-900 font-bold flex items-center justify-center hover:bg-amber-100"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-amber-900 text-xs">
                {susiStrategy.upward}개
              </div>
              <button
                onClick={() =>
                  setSusiStrategy({ ...susiStrategy, upward: Math.min(6, susiStrategy.upward + 1) })
                }
                className="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-900 font-bold flex items-center justify-center hover:bg-amber-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Moderate (적정) */}
          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>적정 지원</span>
              <span className="text-sm bg-white px-2 py-0.5 rounded-md border border-blue-200">
                {susiStrategy.moderate}장
              </span>
            </div>
            <p className="text-[11px] text-blue-700 leading-tight">
              지난 3개년 입결 평균과 내신 및 활동이 유사하여 50% 이상 합격이 기대되는 대학
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSusiStrategy({
                    ...susiStrategy,
                    moderate: Math.max(0, susiStrategy.moderate - 1),
                  })
                }
                className="w-7 h-7 rounded-lg bg-white border border-blue-200 text-blue-900 font-bold flex items-center justify-center hover:bg-blue-100"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-blue-900 text-xs">
                {susiStrategy.moderate}개
              </div>
              <button
                onClick={() =>
                  setSusiStrategy({
                    ...susiStrategy,
                    moderate: Math.min(6, susiStrategy.moderate + 1),
                  })
                }
                className="w-7 h-7 rounded-lg bg-white border border-blue-200 text-blue-900 font-bold flex items-center justify-center hover:bg-blue-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Stable (안정) */}
          <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>안정 지원</span>
              <span className="text-sm bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                {susiStrategy.stable}장
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-tight">
              최초합격 또는 1차 추합권으로 재수 방지를 위해 반드시 확보해야 하는 마지노선
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setSusiStrategy({ ...susiStrategy, stable: Math.max(0, susiStrategy.stable - 1) })
                }
                className="w-7 h-7 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center hover:bg-emerald-100"
              >
                -
              </button>
              <div className="flex-1 text-center font-bold text-emerald-900 text-xs">
                {susiStrategy.stable}개
              </div>
              <button
                onClick={() =>
                  setSusiStrategy({ ...susiStrategy, stable: Math.min(6, susiStrategy.stable + 1) })
                }
                className="w-7 h-7 rounded-lg bg-white border border-emerald-200 text-emerald-900 font-bold flex items-center justify-center hover:bg-emerald-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Strategy Advice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              현재 배분: <strong>상향 {susiStrategy.upward}장 / 적정 {susiStrategy.moderate}장 / 안정 {susiStrategy.stable}장</strong>
              {totalCards === 6
                ? ' (황금 밸런스 조합 완료)'
                : totalCards > 6
                ? ' ⚠️ 6장을 초과했습니다.'
                : ' (아직 6장을 다 채우지 않았습니다)'}
            </span>
          </div>
          <button
            onClick={() =>
              onAskAboutUniversity(
                `현재 내신 ${profile.gpa || '2.3'}등급, 모평 성적을 기준으로 수시 6장 카드를 상향 ${susiStrategy.upward}장, 적정 ${susiStrategy.moderate}장, 안정 ${susiStrategy.stable}장으로 배분하고 싶습니다. 제게 추천하는 구체적인 대학 라인업을 짜주세요.`
              )
            }
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>이 카드 비율로 AI 상담</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Universities Directory */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              대한민국 주요 대학별 대입 가이드 & 합격선
            </h3>
            <p className="text-xs text-slate-500">
              대학별 수시 및 정시 핵심 전형 특징과 AI 컨설팅 연결
            </p>
          </div>

          {/* Search & Region Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="대학명 검색 (예: 성균관대, 한양대)"
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44"
              />
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-700"
            >
              <option value="all">전체 지역</option>
              <option value="서울">서울</option>
              <option value="과학기술원">과학기술원</option>
            </select>
          </div>
        </div>

        {/* University Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUniversities.map((univ) => (
            <div
              key={univ.id}
              className="border border-slate-200 rounded-xl p-4.5 bg-slate-50/40 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                      {univ.name.slice(0, 1)}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{univ.name}</span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {univ.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{univ.region}</span>
                </div>

                <div className="text-xs text-blue-700 font-semibold mb-2 bg-blue-50/70 px-2 py-1 rounded-md">
                  📊 합격 기준선: {univ.avgGradeCut}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                  <div>
                    <span className="font-semibold text-slate-700">📌 수시 특징: </span>
                    <span>{univ.susiTip}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">🎯 정시 특징: </span>
                    <span>{univ.jeongsiTip}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {univ.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() =>
                  onAskAboutUniversity(
                    `현재 제 내신(${profile.gpa || '2.3'}등급)과 모의고사 성적으로 '${univ.name}'에 수시(학종/교과) 또는 정시로 지원 가능한지 정밀 진단해 주세요. 주요 합격 전략과 주의할 점도 알고 싶습니다.`
                  )
                }
                className="w-full py-2 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-semibold text-indigo-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>{univ.name} 맞춤형 대입 전략 상담하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
