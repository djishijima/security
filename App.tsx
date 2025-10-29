
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DetectionModule from './components/DetectionModule';
import EvaluationModule from './components/EvaluationModule';
import ReportListModule from './components/ReportListModule';
import LegalModule from './components/LegalModule';
import SettingsModule from './components/SettingsModule';
import OnboardingGuide from './components/OnboardingGuide';
import QuickInvestigationModule from './components/QuickInvestigationModule';
import InquiryModule from './components/LoginModule'; // Renamed to InquiryModule conceptually
import LandingPage from './components/LandingPage';
import { View, GeneratedReport, Case } from './types';
import { onboardingSteps } from './onboardingSteps';
import { getReports, getCases, getDemoReports, getDemoCases } from './services/dataService';

type GuestInvestigationTarget = {
  domain: string | null;
  file: File | null;
  fileContent: string | null;
  fileName: string | null;
};

const App: React.FC = () => {
  // Simplified state for the new workflow
  const [activeView, setActiveView] = useState<View>(View.LandingPage);
  const [guestInvestigationTarget, setGuestInvestigationTarget] = useState<GuestInvestigationTarget | null>(null);
  
  // States for logged-in / demo mode (kept for potential future use, but guest flow is primary)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);


  useEffect(() => {
    if (isLoggedIn) {
      const fetchInitialData = async () => {
          setLoadingReports(true);
          setLoadingCases(true);
          
          const [initialReports, initialCases] = isDemoMode
            ? await Promise.all([getDemoReports(), getDemoCases()])
            : await Promise.all([getReports(), getCases()]);
            
          setReports(initialReports);
          setCases(initialCases);
          
          if (initialCases.length > 0) {
              setSelectedCaseId(initialCases[0].id);
          }

          setLoadingReports(false);
          setLoadingCases(false);
          setActiveView(View.Dashboard);
      };
      fetchInitialData();
    }
  }, [isLoggedIn, isDemoMode]);


  const handleStartGuestInvestigation = (target: GuestInvestigationTarget) => {
    setGuestInvestigationTarget(target);
    setActiveView(View.Detection);
  };
  
  // New handler for direct investigation from landing page
  const handleStartDirectInvestigation = (domain: string) => {
    setGuestInvestigationTarget({
        domain,
        file: null,
        fileContent: null,
        fileName: null,
    });
    setActiveView(View.Detection);
  };


  const handleStartDiagnosis = () => {
    setActiveView(View.QuickInvestigation);
  };

  const handleInquiryClick = () => {
    window.open('https://form.b-p.co.jp/#/inquiry', '_blank', 'noopener,noreferrer');
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsDemoMode(false);
    setActiveView(View.LandingPage);
    setCases([]);
    setReports([]);
  };

  const handleNavigation = (view: View) => {
     if (view !== View.Legal && view !== View.Evaluation) {
       setSelectedCaseId(cases.length > 0 ? cases[0].id : null);
    }
    setActiveView(view);
  }
  
  const handleSelectCaseAndNavigate = (caseId: number, view: View) => {
    setSelectedCaseId(caseId);
    setActiveView(view);
  };

  const renderContent = () => {
    // This new flow prioritizes the guest experience
    if (!isLoggedIn) {
        switch (activeView) {
            case View.LandingPage:
                return <LandingPage onStartDiagnosis={handleStartDirectInvestigation} />;
            case View.QuickInvestigation:
                return <QuickInvestigationModule onStartInvestigation={handleStartGuestInvestigation} />;
            case View.Detection:
                return <DetectionModule guestTarget={guestInvestigationTarget} onStartNew={() => { setGuestInvestigationTarget(null); setActiveView(View.LandingPage); }} />;
            case View.Inquiry:
                return <InquiryModule />;
            default:
                // Fallback to LandingPage for any other state
                return <LandingPage onStartDiagnosis={handleStartDirectInvestigation} />;
        }
    }

    // --- Logged-in user content ---
    switch (activeView) {
      case View.Dashboard:
        return <Dashboard 
                  cases={cases}
                  loading={loadingCases}
                  onSelectLlmProvider={() => {}}
                  onSelectCase={(caseId) => handleSelectCaseAndNavigate(caseId, View.Legal)}
                  isDemoMode={isDemoMode}
                />;
      case View.Detection: // Logged-in detection module
        return <DetectionModule 
                  cases={cases} 
                  loadingCases={loadingCases}
                  onStartNew={handleLogout}
               />;
      case View.Evaluation:
        return <EvaluationModule 
                  onAddReport={(r) => setReports(prev => [r, ...prev])} 
                  selectedCaseId={selectedCaseId} 
                  cases={cases}
                />;
      case View.Reports:
        return <ReportListModule 
                    reports={reports} 
                    loading={loadingReports}
                    onSelectCase={(caseId) => handleSelectCaseAndNavigate(caseId, View.Legal)} 
                />;
      case View.Legal:
        return <LegalModule 
                    selectedCaseId={selectedCaseId} 
                    cases={cases} 
                    onSelectCase={setSelectedCaseId} 
                />;
      case View.Settings:
        return <SettingsModule />;
      default:
        return <Dashboard 
                  cases={cases}
                  loading={loadingCases}
                  onSelectLlmProvider={() => {}}
                  onSelectCase={(caseId) => handleSelectCaseAndNavigate(caseId, View.Legal)}
                  isDemoMode={isDemoMode}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans">
      {activeView !== View.LandingPage && (
        <Sidebar 
          activeView={activeView} 
          setActiveView={handleNavigation} 
          restartTour={() => {}}
          isLoggedIn={isLoggedIn}
          isDemoMode={isDemoMode}
          onInquiry={handleInquiryClick}
          onLogout={handleLogout}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isDemoMode && (
          <div className="bg-red-600 text-white text-center py-2 font-bold text-sm shadow-lg z-10">
            現在デモモードで閲覧中です
          </div>
        )}
        <main className={`flex-1 overflow-y-auto ${activeView !== View.LandingPage ? 'p-8' : ''}`}>
          <div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;