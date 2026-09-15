import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import { initializeStorage } from './utils/storage';

// Student Pages
import PersonalDashboard from './pages/PersonalDashboard';
import TimetablePage from './pages/TimetablePage';
import PersonalSubjectsPage from './pages/PersonalSubjectsPage';
import CalendarPage from './pages/CalendarPage';
import HolidaysAndDeadlinesPage from './pages/HolidaysAndDeadlinesPage';
import SettingsPage from './pages/SettingsPage';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});

  useEffect(() => {
    initializeStorage();
  }, []);

  const handleNavigate = (page, params = {}) => {
    if (page) {
      setCurrentPage(page);
      setPageParams(params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PersonalDashboard onNavigate={handleNavigate} />;
      case 'timetable':
        return <TimetablePage onNavigate={handleNavigate} />;
      case 'subjects':
        return <PersonalSubjectsPage onNavigate={handleNavigate} />;
      case 'calendar':
        return <CalendarPage onNavigate={handleNavigate} />;
      case 'holidays':
        return <HolidaysAndDeadlinesPage onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <PersonalDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}
