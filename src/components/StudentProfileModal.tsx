import React, { useState } from 'react';
import { StudentProfile } from '../types/admission';
import { UserCheck, Sparkles, X, Target, Award, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onSave: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-semibold shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">내 입시 스펙 & 성적 프로필</h2>
              <p className="text-xs text-slate-500">입력된 정보는 AI 컨설턴트가 1:1 맞춤형 진단 및 답변에 활용합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* 1. 기본 학년 및 계열 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                현재 학년
              </label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="고1">고등학교 1학년</option>
                <option value="고2">고등학교 2학년</option>
                <option value="고3">고등학교 3학년</option>
                <option value="N수">N수생 / 졸업생</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                희망 전공 계열
              </label>
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="자연·공학계열">자연·공학계열 (IT, 반도체, 기계, 신소재 등)</option>
                <option value="의약학계열">의약학계열 (의예, 치의예, 한의예, 약학, 수의예)</option>
                <option value="인문·사회계열">인문·사회계열 (어문, 철학, 역사, 사회학, 미디어)</option>
                <option value="상경계열">상경계열 (경영, 경제, 금융, 통계)</option>
                <option value="교육계열">교육계열 (사범대, 교육공학, 초등교육)</option>
                <option value="예술·체육계열">예술·체육계열</option>
                <option value="자율전공/무전공">자율전공 / 무전공 학부</option>
              </select>
            </div>
          </div>

          {/* 2. 학교 내신 등급 */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" />
                학교생활기록부 내신 등급 (석차등급 1.0 ~ 9.0)
              </span>
              <span className="text-[11px] text-slate-500">주요 교과 기준</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">전과목 평균</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="9"
                  placeholder="예: 2.30"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-center font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">국어</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.gpaKorean}
                  onChange={(e) => setFormData({ ...formData, gpaKorean: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">수학</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.gpaMath}
                  onChange={(e) => setFormData({ ...formData, gpaMath: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">영어</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.gpaEnglish}
                  onChange={(e) => setFormData({ ...formData, gpaEnglish: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-center"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">탐구 (사/과)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.gpaInquiry}
                  onChange={(e) => setFormData({ ...formData, gpaInquiry: e.target.value ? parseFloat(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-center"
                />
              </div>
            </div>
          </div>

          {/* 3. 모의고사 성적 */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600" />
                최근 전국연합 모의평가 등급 (1~9등급)
              </span>
              <span className="text-[11px] text-slate-500">6월/9월 모평 또는 학평</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">국어 모평</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.mockKorean}
                  onChange={(e) => setFormData({ ...formData, mockKorean: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-center font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">수학 모평</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.mockMath}
                  onChange={(e) => setFormData({ ...formData, mockMath: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-center font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">영어 모평</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.mockEnglish}
                  onChange={(e) => setFormData({ ...formData, mockEnglish: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-center font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">탐구 평균</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  placeholder="등급"
                  value={formData.mockInquiry}
                  onChange={(e) => setFormData({ ...formData, mockInquiry: e.target.value ? parseInt(e.target.value) : '' })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white text-center font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. 희망 목표 대학 및 전공 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                목표 희망 대학 (1~3곳)
              </label>
              <input
                type="text"
                placeholder="예: 서울대, 연세대, 고려대 / 성균관대, 한양대"
                value={formData.targetUniversities}
                onChange={(e) => setFormData({ ...formData, targetUniversities: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                희망 세부 학과
              </label>
              <input
                type="text"
                placeholder="예: 컴퓨터공학과, 인공지능융합학부, 경영학부"
                value={formData.targetMajor}
                onChange={(e) => setFormData({ ...formData, targetMajor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              />
            </div>
          </div>

          {/* 5. 학생 고민 메모 */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
              현재 가장 큰 대입 고민 및 학생부 특이사항
            </label>
            <textarea
              rows={3}
              placeholder="예: 일반고 내신 2.3등급인데 교과로 갈지 학종으로 갈지 고민입니다. 수학 세특에 인공지능 관련 탐구를 썼는데 면접 대비가 걱정돼요."
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white resize-none"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              프로필 저장 및 AI 연동
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
