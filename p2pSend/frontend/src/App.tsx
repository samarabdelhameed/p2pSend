import { useState } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import Landing from './pages/Landing';
import Send from './pages/Send';
import Receive from './pages/Receive';

type Page = 'landing' | 'send' | 'receive';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = (page: Page) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentPage(page);
      setIsTransitioning(false);
    }, 300);
  };

  return (
    <>
      <AnimatedBackground />
      <div
        className={`
          transition-all duration-300
          ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        {currentPage === 'landing' && <Landing onNavigate={navigateTo} />}
        {currentPage === 'send' && <Send onNavigate={navigateTo} />}
        {currentPage === 'receive' && <Receive onNavigate={navigateTo} />}
      </div>
    </>
  );
}

export default App;
