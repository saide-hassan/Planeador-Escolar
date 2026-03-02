/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import LessonForm from './components/LessonForm';
import WelcomeScreen from './components/WelcomeScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      // slate-950 for dark mode, slate-50 for light mode
      const themeColor = isDark ? '#020617' : '#f8fafc';
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    };

    // Initial update
    updateThemeColor();

    // Observe class changes on html element
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 py-8 transition-colors duration-500">
        {showWelcome ? (
          <WelcomeScreen onStart={() => setShowWelcome(false)} />
        ) : (
          <div key="main-content">
            <LessonForm />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
