import React from 'react';
import { StudentProfile } from '../types/admission';
import {
  GraduationCap,
  MessageSquare,
  TrendingUp,
  FileText,
  Compass,
  HeartPulse,
  UserCheck,
  Sparkles,
  CalendarDays,
} from 'lucide-react';

export type NavTabId = 'chat' | 'planner' | 'diagnostic' | 'setek' | 'roadmap' | 'mental';

interface Props {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  profile,
  onOpenProfile,
}) => {
  const tabs = [
    {
      id: 'chat' as NavTabId,
      label: 'AI 1:1 입시상담소',
      icon: MessageSquare,
      badge: '실시간 입시',
    },
    {
      id: 'planner' as NavTabId,
      label: 'AI 맞춤 학습플래너',
      icon: CalendarDays,
      badge: '교재·인강 추천',
    },
    {
      id: 'diagnostic' as NavTabId,
      label: '성적·전형 정밀진단',
      icon: TrendingUp,
      badge: '수시/정시',
    },
    {
      id: 'setek' as NavTabId,
      label: '생기부 세특 기획기',
      icon: FileText,
      badge: '학종 특화',
    },
    {
      id: 'roadmap' as NavTabId,
      label: '대입 로드맵 & 대학',
      icon: Compass,
      badge: 'D-Day',
    },
    {
      id: 'mental' as NavTabId,
      label: '멘탈 & 집중 라운지',
      icon: HeartPulse,
      badge: '수험생 케어',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('chat')}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 text-lg tracking-tight">
                  PathFinder
                </span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                  AI 대입 컨설팅
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                대한민국 고등학생을 위한 1:1 맞춤형 진학 솔루션
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[9.5px] px-1.5 py-0.2 rounded font-medium ${
                        isActive
                          ? 'bg-white/20 text-indigo-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Student Profile Chip */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 bg-white transition-all text-xs text-left shadow-2xs group cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                  내 입시 프로필
                </span>
                <span className="font-bold text-slate-800 text-xs block leading-tight">
                  {profile.grade} · 내신 {profile.gpa || '-'}등급
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Tab Bar */}
        <div className="flex lg:hidden items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
