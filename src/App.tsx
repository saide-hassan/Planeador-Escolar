/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import LessonForm from './components/LessonForm';
import UpdateModal from './components/UpdateModal';
import WelcomeScreen from './components/WelcomeScreen';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors duration-300">
      {showWelcome ? (
        <WelcomeScreen onStart={() => setShowWelcome(false)} />
      ) : (
        <>
          <UpdateModal />
          <LessonForm />
        </>
      )}
    </div>
  );
}
