import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  ConsultantPersonaId,
  StudentProfile,
} from '../types/admission';
import { CONSULTANT_PERSONAS } from '../data/admissionsData';
import {
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  GraduationCap,
  Target,
  Compass,
  HeartPulse,
  UserCheck,
  Bot,
  User,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Lightbulb,
  Globe,
  BookCheck,
  FolderClock,
  Trash2,
  X,
} from 'lucide-react';
import {
  fetchServerChats,
  saveServerChatSession,
  deleteServerChatSession,
  SavedChatSession,
} from '../services/backendStorage';

interface Props {
  profile: StudentProfile;
  onOpenProfile: () => void;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

export const ChatConsulting: React.FC<Props> = ({
  profile,
  onOpenProfile,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const [selectedPersonaId, setSelectedPersonaId] =
    useState<ConsultantPersonaId>('susi');
  const [includeProfile, setIncludeProfile] = useState<boolean>(true);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `session-${Date.now()}`);
  const [savedSessions, setSavedSessions] = useState<SavedChatSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Load chat sessions from backend server on mount
  const loadSessionsFromServer = async () => {
    const list = await fetchServerChats();
    setSavedSessions(list);
  };

  useEffect(() => {
    loadSessionsFromServer();
  }, []);

  // Initial welcome message per persona
  const getInitialMessage = (personaId: ConsultantPersonaId): ChatMessage => {
    const persona = CONSULTANT_PERSONAS.find((p) => p.id === personaId)!;
    let greeting = '';
    if (personaId === 'susi') {
      greeting = `안녕하세요! 학생부종합·교과 수시 전문 컨설턴트 **${persona.name}**입니다. 🎓\n\n내신 등급, 희망 학과, 생기부 세특 활동, 수시 6장 카드 배분 전략 등 수시 입시에 관한 모든 궁금증을 명쾌하게 풀어드립니다.\n\n어떤 점이 가장 고민이신가요? 아래 추천 질문을 누르시거나 직접 물어보세요!`;
    } else if (personaId === 'jeongsi') {
      greeting = `반갑습니다! 정시·수능 전략연구소장 **${persona.name}**입니다. 🎯\n\n수능 모의평가(3·6·9월) 성적 분석, 국/수/영/탐 환산표점, 정시 가/나/다군 합격선 포트폴리오를 데이터로 정밀하게 짚어드립니다.\n\n현재 성적이나 목표 대학을 알려주시면 실질적인 지원 전략을 세워드릴게요!`;
    } else if (personaId === 'major') {
      greeting = `반갑습니다, 수험생 여러분! 전공 진로 설계 멘토 **${persona.name}** 교수입니다. 🧭\n\n"이 학과에서는 구체적으로 무엇을 배울까?", "컴공과 vs AI학과의 차이는?", "고등학교에서 어떤 선택과목을 이수해야 유리할까?" 등 학과와 진로에 대한 모든 길을 안내해 드립니다.`;
    } else if (personaId === 'info') {
      greeting = `반갑습니다! 실시간 입시 정보 & 전형 팩트체커 **${persona.name}** 수석연구원입니다. 🌐\n\n- **대학별 최신 전형 요강**: 2025~2028 무전공(자율전공) 선발 확대, 의약학 증원, 주요 대학 수시/정시 변경사항\n- **수능 & 모의평가 일정**: 수능 D-Day, 6월/9월 모평 및 원서접수 공식 타임라인\n- **자기소개서 작성 바이블**: 대교협 공통 1번(학업·진로) 및 2번(공동체), 대학별 자율 3번 문항 합격 작성 공식과 주의사항\n\n최신 입시 정보에 대해 무엇이든 질문해 주세요!`;
    } else {
      greeting = `안녕! 수험생 여러분의 페이스메이커 **${persona.name}** 쌤이에요. 💖\n\n공부하다 문득 찾아오는 슬럼프, 모의고사 후 밀려오는 불안감, 시간 관리나 플래너 고민까지 혼자 끙끙 앓지 말고 편하게 털어놓으세요. 언제나 여러분 곁에서 든든하게 응원할게요!`;
    }

    return {
      id: `welcome-${personaId}`,
      role: 'model',
      text: greeting,
      timestamp: Date.now(),
      personaId: personaId,
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [getInitialMessage('susi')];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activePersona =
    CONSULTANT_PERSONAS.find((p) => p.id === selectedPersonaId) ||
    CONSULTANT_PERSONAS[0];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external initial question trigger (e.g. from Diagnostic report)
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      handleSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  // Switch persona
  const handlePersonaChange = (newPersonaId: ConsultantPersonaId) => {
    setSelectedPersonaId(newPersonaId);
    // Add welcome message if changing or reset
    setMessages([getInitialMessage(newPersonaId)]);
  };

  // Reset chat
  const handleResetChat = () => {
    setCurrentSessionId(`session-${Date.now()}`);
    setMessages([getInitialMessage(selectedPersonaId)]);
  };

  // Select a saved session from server
  const handleSelectSession = (session: SavedChatSession) => {
    setCurrentSessionId(session.id);
    setSelectedPersonaId(session.personaId);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  // Delete a saved session from server
  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteServerChatSession(id);
    loadSessionsFromServer();
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send message with streaming
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
      personaId: selectedPersonaId,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    const botMessageId = `bot-${Date.now()}`;
    const initialBotMessage: ChatMessage = {
      id: botMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      personaId: selectedPersonaId,
      isStreaming: true,
    };

    setMessages([...newMessages, initialBotMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          persona: selectedPersonaId,
          profile: includeProfile ? profile : undefined,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('상담 서버 응답 오류가 발생했습니다.');
      }

      if (!response.body) {
        throw new Error('응답 스트림을 읽을 수 없습니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: accumulatedText, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (err) {
              // Ignore non-json or incomplete chunks
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

      // Persist session to backend server
      const firstUserMsg = newMessages.find((m) => m.role === 'user');
      const title = firstUserMsg ? firstUserMsg.text.slice(0, 30) : '새 입시 상담';
      const finalBotMsg: ChatMessage = {
        id: botMessageId,
        role: 'model',
        text: accumulatedText,
        timestamp: Date.now(),
        personaId: selectedPersonaId,
        isStreaming: false,
      };
      saveServerChatSession({
        id: currentSessionId,
        personaId: selectedPersonaId,
        title,
        messages: [...newMessages, finalBotMsg],
      }).then(() => loadSessionsFromServer());
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text:
                  msg.text ||
                  '죄송합니다. 상담 답변을 불러오는 중 일시적인 오류가 발생했습니다. 잠시 후 다시 질문해 주세요.',
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonaIcon = (id: ConsultantPersonaId) => {
    switch (id) {
      case 'susi':
        return <GraduationCap className="w-5 h-5" />;
      case 'jeongsi':
        return <Target className="w-5 h-5" />;
      case 'major':
        return <Compass className="w-5 h-5" />;
      case 'mentor':
        return <HeartPulse className="w-5 h-5" />;
      case 'info':
        return <Globe className="w-5 h-5" />;
    }
  };

  // Simple Markdown renderer helper for bolding, bullet points, and headers
  const renderFormattedText = (content: string) => {
    return (
      <div className="space-y-2 text-[14.5px] leading-relaxed">
        {content.split('\n\n').map((paragraph, pIdx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h4 key={pIdx} className="font-bold text-slate-900 text-base mt-2 mb-1">
                {paragraph.replace('### ', '')}
              </h4>
            );
          }
          if (paragraph.startsWith('## ')) {
            return (
              <h3 key={pIdx} className="font-bold text-slate-900 text-lg mt-3 mb-1.5 border-b pb-1">
                {paragraph.replace('## ', '')}
              </h3>
            );
          }
          return (
            <p key={pIdx} className="whitespace-pre-line">
              {paragraph.split('**').map((segment, sIdx) => {
                if (sIdx % 2 === 1) {
                  return (
                    <strong key={sIdx} className="font-semibold text-indigo-950 bg-indigo-50/70 px-1 py-0.5 rounded">
                      {segment}
                    </strong>
                  );
                }
                return segment;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] max-w-5xl mx-auto w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Bar: Persona Selection & Profile Context */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Personas Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {CONSULTANT_PERSONAS.map((p) => {
            const isSelected = p.id === selectedPersonaId;
            return (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shadow-xs ${
                  isSelected
                    ? `${p.badgeColor} ring-2 ring-indigo-500/20 shadow-sm`
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {getPersonaIcon(p.id)}
                <span>{p.name} {p.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Server Saved Sessions Button */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            title="서버에 저장된 대화 목록"
          >
            <FolderClock className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">서버 상담록</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {savedSessions.length}
            </span>
          </button>

          {/* Profile Context Toggle */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-2xs">
            <input
              type="checkbox"
              id="includeProfileCheck"
              checked={includeProfile}
              onChange={(e) => setIncludeProfile(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
            />
            <label
              htmlFor="includeProfileCheck"
              className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>내 성적 반영</span>
              {profile.gpa && (
                <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                  {profile.grade}·{profile.gpa}등급
                </span>
              )}
            </label>
            <button
              onClick={onOpenProfile}
              className="text-[11px] text-slate-400 hover:text-indigo-600 underline ml-0.5"
            >
              수정
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleResetChat}
            title="대화 초기화 및 새 상담"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persona Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-5 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10 text-indigo-300">
            {getPersonaIcon(activePersona.id)}
          </div>
          <div>
            <span className="font-bold text-white mr-2">{activePersona.name}</span>
            <span className="text-indigo-200 font-medium">{activePersona.title}</span>
            <span className="hidden md:inline text-slate-400 ml-2">| {activePersona.description}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-indigo-300 bg-white/10 px-2 py-1 rounded-md">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Gemini 3.8 Flash 연동</span>
        </div>
      </div>

      {/* Chat Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-indigo-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : getPersonaIcon(selectedPersonaId)}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative group rounded-2xl p-4 sm:p-5 shadow-xs max-w-[85%] ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {/* Header info in bot bubble */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      {activePersona.name} {activePersona.title.split(' ')[0]}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                    <button
                      onClick={() => handleCopy(message.id, message.text)}
                      className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[11px] transition-colors"
                      title="답변 복사"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>복사</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Message Content */}
                {isUser ? (
                  <p className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap font-medium">
                    {message.text}
                  </p>
                ) : (
                  <div>
                    {message.text ? (
                      renderFormattedText(message.text)
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 py-1 text-sm">
                        <Sparkles className="w-4 h-4 animate-spin text-indigo-500" />
                        <span>답변을 생성하고 있습니다...</span>
                      </div>
                    )}

                    {message.isStreaming && message.text && (
                      <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-1 align-middle" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips & Real-time Info Presets */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex flex-col gap-2">
        {/* Real-time topic categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1">
          <span className="font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <BookCheck className="w-3.5 h-3.5 text-rose-500" />
            실시간 입시 테마:
          </span>
          <button
            type="button"
            onClick={() => {
              if (selectedPersonaId !== 'info') handlePersonaChange('info');
              handleSendMessage('2026/2027학년도 주요 대학(서연고·성한서·중경외시) 최신 전형 변동사항과 핵심 평가 포인트를 브리핑해줘.');
            }}
            className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold border border-rose-200 shrink-0 transition-colors"
          >
            🏫 대학별 최신 전형 요강
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedPersonaId !== 'info') handlePersonaChange('info');
              handleSendMessage('올해 수능 및 6월/9월 모의평가 공식 일정, D-Day, 성적 통지일과 수험생 필수 대비 전략을 정리해줘.');
            }}
            className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold border border-blue-200 shrink-0 transition-colors"
          >
            📅 수능 & 모평 시험 일정
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedPersonaId !== 'info') handlePersonaChange('info');
              handleSendMessage('학생부종합전형 자기소개서 공통 1번(진로 및 학업 경험)과 2번(공동체 기여), 3번 자율문항의 합격 공식과 작성 가이드를 알려줘.');
            }}
            className="px-2.5 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold border border-purple-200 shrink-0 transition-colors"
          >
            ✍️ 자기소개서(자소서) 작성법
          </button>
          <button
            type="button"
            onClick={() => {
              if (selectedPersonaId !== 'info') handlePersonaChange('info');
              handleSendMessage('무전공(자율전공) 선발 대폭 확대와 사탐런(이과생의 사탐 응시) 현상에 따른 대학별 탐구 가산점과 유불리를 분석해줘.');
            }}
            className="px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold border border-amber-200 shrink-0 transition-colors"
          >
            🔥 무전공 확대 & 사탐런 팩트체크
          </button>
        </div>

        {/* Persona Recommended Prompts */}
        {messages.length <= 2 && (
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>추천 질문:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {activePersona.recommendedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  disabled={isLoading}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 transition-all text-left whitespace-nowrap shadow-2xs disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`${activePersona.name} 컨설턴트에게 입시 질문을 입력하세요 (예: 6모 국어 3 수학 1 정시 라인은?)`}
              disabled={isLoading}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 disabled:bg-slate-100 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white shadow-md shadow-indigo-600/20 disabled:shadow-none transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-[11px] text-slate-400 text-center mt-2">
          AI 대입 상담은 2025~2027 최신 대입 전형 요강 데이터를 기반으로 추정되며, 실제 최종 원서 접수 시 각 대학 모집요강을 반드시 재확인하시기 바랍니다.
        </p>
      </div>

      {/* Saved Sessions Modal (Backend Server Storage) */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <FolderClock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">백엔드 서버 저장 상담록</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {savedSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  서버에 저장된 이전 상담 내역이 없습니다.
                </div>
              ) : (
                savedSessions.map((session) => {
                  const persona = CONSULTANT_PERSONAS.find((p) => p.id === session.personaId);
                  const isCurrent = session.id === currentSessionId;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            persona?.badgeColor || 'bg-slate-600 text-white'
                          }`}
                        >
                          {getPersonaIcon(session.personaId)}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {session.title || '입시 상담'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold shrink-0">
                                진행 중
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {persona?.name} {persona?.title.split(' ')[0]} · {new Date(session.updatedAt).toLocaleDateString('ko-KR')} {new Date(session.updatedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} · 메시지 {session.messages?.length || 0}개
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteSession(e, session.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                        title="서버에서 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-400">클릭하면 해당 상담 내용이 복원됩니다.</span>
              <button
                onClick={() => {
                  handleResetChat();
                  setIsHistoryOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                새 상담 시작
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
