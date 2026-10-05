import React, { useState, useEffect } from 'react';
import { Navbar, NavTabId } from './components/Navbar';
import { ChatConsulting } from './components/ChatConsulting';
import { StudyPlanner } from './components/StudyPlanner';
import { AdmissionsDiagnostic } from './components/AdmissionsDiagnostic';
import { SetekGenerator } from './components/SetekGenerator';
import { AdmissionsRoadmap } from './components/AdmissionsRoadmap';
import { MentalEncouragement } from './components/MentalEncouragement';
import { StudentProfileModal } from './components/StudentProfileModal';
import { StudentProfile } from './types/admission';
import { INITIAL_STUDENT_PROFILE } from './data/admissionsData';
import {
  fetchServerProfile,
  saveServerProfile,
} from './services/backendStorage';
import { Database, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('chat');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<string>('');
  const [isServerSynced, setIsServerSynced] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Persist student profile in state, initialized from server or localStorage
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('pathfinder_student_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STUDENT_PROFILE;
  });

  // Load student profile directly from backend server on initial launch
  useEffect(() => {
    async function loadFromServer() {
      const serverProfile = await fetchServerProfile();
      if (serverProfile) {
        setProfile(serverProfile);
        setIsServerSynced(true);
        setLastSyncTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
        try {
          localStorage.setItem('pathfinder_student_profile', JSON.stringify(serverProfile));
        } catch (e) {}
      }
    }
    loadFromServer();
  }, []);

  const handleSaveProfile = async (updated: StudentProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('pathfinder_student_profile', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    // Save directly to backend server
    const saved = await saveServerProfile(updated);
    if (saved) {
      setIsServerSynced(true);
      setLastSyncTime(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Switch to chat with a pre-filled query from other modules
  const handleTransitionToChat = (question: string) => {
    setChatInitialQuestion(question);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'chat' && (
          <ChatConsulting
            profile={profile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            initialQuestion={chatInitialQuestion}
            onClearInitialQuestion={() => setChatInitialQuestion('')}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            profile={profile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onConsultWithPlan={handleTransitionToChat}
          />
        )}

        {activeTab === 'diagnostic' && (
          <AdmissionsDiagnostic
            profile={profile}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onConsultWithDiagnostic={handleTransitionToChat}
          />
        )}

        {activeTab === 'setek' && (
          <SetekGenerator
            profile={profile}
            onConsultWithTopic={handleTransitionToChat}
          />
        )}

        {activeTab === 'roadmap' && (
          <AdmissionsRoadmap
            profile={profile}
            onAskAboutUniversity={handleTransitionToChat}
          />
        )}

        {activeTab === 'mental' && (
          <MentalEncouragement onTalkToMentor={handleTransitionToChat} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">패스파인더 (PathFinder)</span>
            <span>· 대한민국 고등학생을 위한 맞춤형 AI 대입 컨설팅</span>
            <div className="hidden md:flex items-center gap-1.5 ml-2 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>백엔드 서버 데이터 저장 활성화 {lastSyncTime && `(${lastSyncTime})`}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>2025~2028 대입 전형 기준</span>
            <span>수시·정시·학종·세특 1:1 AI 상담</span>
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
