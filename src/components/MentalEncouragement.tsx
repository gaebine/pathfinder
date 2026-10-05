import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Wind,
  Coffee,
  MessageSquare,
  Smile,
  CheckCircle,
} from 'lucide-react';

interface Props {
  onTalkToMentor: (query: string) => void;
}

const MOTIVATION_QUOTES = [
  {
    quote: '성공은 매일 반복되는 작은 노력들의 합이다.',
    author: '로버트 콜리어',
    context: '오늘 푼 문제 한 장, 외운 단어 10개가 결국 수능 날의 당신을 만듭니다.',
  },
  {
    quote: '지금의 불안함은 당신이 진심으로 잘해내고 싶다는 증거입니다.',
    author: '대입 합격 선배들의 멘토링 노트',
    context: '불안은 실패의 징조가 아니라, 성장을 갈망하는 뜨거운 에너지입니다.',
  },
  {
    quote: '넘어지는 것은 부끄러운 일이 아니지만, 넘어진 채로 머무는 것은 부끄러운 일이다.',
    author: '공부의 본질',
    context: '모의고사 한 번 망쳤다고 무너지지 마세요. 본고사는 아직 남아있습니다.',
  },
  {
    quote: '우리가 두려워해야 할 유일한 것은 두려움 그 자체다.',
    author: '프랭클린 D. 루스벨트',
    context: '시험장의 떨림은 심장이 뇌로 산소를 뿜어내어 집중력을 올리는 신호입니다.',
  },
];

export const MentalEncouragement: React.FC<Props> = ({ onTalkToMentor }) => {
  // Pomodoro timer state
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'study' | 'rest'>('study');

  // Breathing exercise
  const [breathingPhase, setBreathingPhase] = useState<'숨 들이마시기 (4초)' | '숨 참기 (7초)' | '천천히 내쉬기 (8초)' | '준비'>('준비');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);

  // Quote
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState<number>(0);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      if (timerMode === 'study') {
        alert('🎉 25분 집중 완료! 5분간 편안하게 휴식을 취하세요.');
        setTimerMode('rest');
        setSecondsLeft(5 * 60);
      } else {
        alert('🔔 5분 휴식 종료! 다시 집중해볼까요?');
        setTimerMode('study');
        setSecondsLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, timerMode]);

  // Breathing guide logic
  useEffect(() => {
    let timeout: any;
    if (isBreathingActive) {
      setBreathingPhase('숨 들이마시기 (4초)');
      timeout = setTimeout(() => {
        setBreathingPhase('숨 참기 (7초)');
        timeout = setTimeout(() => {
          setBreathingPhase('천천히 내쉬기 (8초)');
          timeout = setTimeout(() => {
            // Repeat
            setIsBreathingActive(true);
          }, 8000);
        }, 7000);
      }, 4000);
    } else {
      setBreathingPhase('준비');
    }
    return () => clearTimeout(timeout);
  }, [isBreathingActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = (mode: 'study' | 'rest') => {
    setIsActive(false);
    setTimerMode(mode);
    setSecondsLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {/* Daily Motivation Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            오늘의 수험생 비타민 명언
          </span>
          <button
            onClick={() => setCurrentQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length)}
            className="text-xs text-indigo-200 hover:text-white underline"
          >
            다음 명언 보기
          </button>
        </div>

        <blockquote className="space-y-2 my-2">
          <p className="text-lg md:text-xl font-bold leading-relaxed text-slate-100">
            "{MOTIVATION_QUOTES[currentQuoteIdx].quote}"
          </p>
          <cite className="block text-xs text-indigo-300 not-italic font-medium">
            — {MOTIVATION_QUOTES[currentQuoteIdx].author}
          </cite>
        </blockquote>

        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-300">
            {MOTIVATION_QUOTES[currentQuoteIdx].context}
          </span>
          <button
            onClick={() =>
              onTalkToMentor(
                '요즘 공부하다가 자꾸 불안하고 슬럼프가 온 것 같아요. 스스로 자책하게 되는데, 마인드 컨트롤과 멘탈 회복 팁을 알려주세요.'
              )
            }
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold hover:bg-indigo-50 flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>최멘토 쌤과 멘탈 상담</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Pomodoro Focus Timer */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">수험생 뽀모도로 몰입 타이머</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                {timerMode === 'study' ? '📖 25분 열공 모드' : '☕ 5분 휴식 모드'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              25분 동안 휴대폰을 멀리하고 한 과목에만 온전히 몰입한 뒤 5분간 뇌를 쉬어주는 가장 효과적인 수험생 집중법입니다.
            </p>

            {/* Timer Display */}
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
              <span className="text-5xl md:text-6xl font-extrabold tracking-wider font-mono text-slate-900">
                {formatTime(secondsLeft)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                }`}
              >
                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isActive ? '일시 정지' : '집중 시작하기'}</span>
              </button>
              <button
                onClick={() => handleResetTimer(timerMode)}
                className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                title="타이머 리셋"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <button
                onClick={() => handleResetTimer('study')}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  timerMode === 'study'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                25분 공부
              </button>
              <button
                onClick={() => handleResetTimer('rest')}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  timerMode === 'rest'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                5분 휴식
              </button>
            </div>
          </div>
        </div>

        {/* 2. Test Anxiety Breathing Guide */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">시험 불안 완화 4-7-8 호흡법</h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              시험 시작 직전이나 모의고사 전 긴장감으로 심장이 빠르게 뛸 때 자율신경계를 안정시키는 하버드 의대 검증 호흡법입니다.
            </p>

            {/* Breathing Circle Animation Visual */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-2xl border border-slate-100 mb-6 min-h-[160px]">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  isBreathingActive
                    ? breathingPhase.includes('들이마시기')
                      ? 'scale-125 bg-emerald-200 text-emerald-800'
                      : breathingPhase.includes('참기')
                      ? 'scale-125 bg-amber-200 text-amber-800'
                      : 'scale-90 bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Wind className="w-8 h-8" />
              </div>
              <span className="font-bold text-slate-800 text-sm mt-4">
                {breathingPhase}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                isBreathingActive
                  ? 'bg-slate-700 hover:bg-slate-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <span>{isBreathingActive ? '호흡 가이드 종료' : '4-7-8 호흡 시작하기'}</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center">
              코로 4초 들이마시고 → 7초간 숨을 멈춘 뒤 → 입으로 8초간 천천히 내쉽니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
