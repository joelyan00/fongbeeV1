
import React, { useState, useRef } from 'react';
import { Header } from './components/Header';
import { ServiceGrid } from './components/ServiceGrid';
import { Banners } from './components/Banners';
import { BottomNav } from './components/BottomNav';
import { ChatInterface } from './components/ChatInterface';
import { LocationSearchModal } from './components/LocationSearchModal';
import { ServiceListings } from './components/ServiceListings';
import { PopularArticles } from './components/PopularArticles';
import { CategoryPage } from './components/CategoryPage';
import { StandardServicesPage } from './components/StandardServicesPage';
import { CustomServicesPage } from './components/CustomServicesPage';
import { CustomServicesTab } from './components/CustomServicesTab';
import { ProfileTab } from './components/ProfileTab';

import { ArticleDetailPage } from './components/ArticleDetailPage';

type TabView = 'home' | 'standard' | 'custom' | 'profile';
type ViewState = 'main' | 'category_detail' | 'custom_services' | 'article_detail';

const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabView>('home');
  const [viewState, setViewState] = useState<ViewState>('main');

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");

  // Common State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("多伦多");

  // Ref for scrolling
  const listingsRef = useRef<HTMLDivElement>(null);

  const handleLocationSelect = (location: string) => {
    let simplifiedName = location;
    if (location.includes('(')) {
      simplifiedName = location.split(' ')[0];
    }
    setCurrentLocation(simplifiedName);
    setIsLocationModalOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Switch to Category Detail Page
    setViewState('category_detail');
    window.scrollTo(0, 0);
  };

  const handleArticleClick = (articleId: string) => {
    setSelectedArticleId(articleId);
    setViewState('article_detail');
    window.scrollTo(0, 0);
  };

  const handleBackToHome = () => {
    setViewState('main');
    window.scrollTo(0, 0);
  };

  const handleTabChange = (tab: TabView) => {
    setActiveTab(tab);
    setViewState('main'); // Reset to main view of that tab
    window.scrollTo(0, 0);
  };

  const handleViewAllCustomServices = () => {
    setViewState('custom_services');
    window.scrollTo(0, 0);
  };

  // --------------------------------------------------------------------------
  // RENDER CONTENT BASED ON TAB & VIEW STATE
  // --------------------------------------------------------------------------

  const renderContent = () => {
    // 0. Article Detail Page (High Priority)
    if (viewState === 'article_detail') {
      return (
        <ArticleDetailPage
          articleId={selectedArticleId}
          onBack={handleBackToHome}
        />
      );
    }

    // 1. Detailed Category Page (Highest Priority Overlay)
    if (viewState === 'category_detail') {
      return (
        <CategoryPage
          categoryName={selectedCategory}
          onBack={handleBackToHome}
        />
      );
    }

    // 2. Custom Services Full List Page
    if (viewState === 'custom_services') {
      return (
        <CustomServicesPage
          category={selectedCategory || "全部服务"}
          onBack={handleBackToHome}
        />
      );
    }

    // 3. Standard Services Tab
    if (activeTab === 'standard') {
      return <StandardServicesPage onCategorySelect={handleCategorySelect} />;
    }

    // 4. Custom Services Tab
    if (activeTab === 'custom') {
      return <CustomServicesTab />;
    }

    // 5. Profile Tab
    if (activeTab === 'profile') {
      return <ProfileTab />;
    }

    // 6. Default: HOME Tab
    return (
      <div className="pb-24 md:pb-10">
        {/* Header */}
        <Header
          onSearchClick={() => setIsChatOpen(true)}
          onLocationClick={() => setIsLocationModalOpen(true)}
          locationName={currentLocation}
        />

        <div className="max-w-7xl mx-auto overflow-visible">
          <div className="px-4 md:px-8 pt-4">
            <Banners />
          </div>
          <ServiceGrid onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />

          <div className="md:px-4" ref={listingsRef}>
            <ServiceListings
              category={selectedCategory || "房产交易"}
              currentLocation={currentLocation}
              onViewAll={handleViewAllCustomServices}
            />
            <PopularArticles onArticleClick={handleArticleClick} />
          </div>

          <div className="hidden md:flex justify-center items-center py-10 mt-6 border-t border-gray-200">
            <span className="text-gray-500 font-bold text-lg tracking-wide">优质服务 · fongbee到家</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] relative font-sans text-gray-900">
      {renderContent()}

      {/* Global Bottom Nav (Visible unless in detail view or on Desktop) */}
      {viewState === 'main' && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      {isChatOpen && (
        <ChatInterface onClose={() => setIsChatOpen(false)} />
      )}

      {isLocationModalOpen && (
        <LocationSearchModal
          onClose={() => setIsLocationModalOpen(false)}
          onSelect={handleLocationSelect}
        />
      )}
    </div>
  );
};

export default App;
