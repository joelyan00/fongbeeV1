
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Navigation } from 'lucide-react';

interface LocationSearchModalProps {
  onClose: () => void;
  onSelect: (location: string) => void;
}

// Mock Database of GTA and Greater Vancouver locations
const MOCK_LOCATIONS = [
  // GTA Cities/Areas
  { name: 'Toronto', type: 'City' },
  { name: 'North York', type: 'City' },
  { name: 'Scarborough', type: 'City' },
  { name: 'Etobicoke', type: 'City' },
  { name: 'Mississauga', type: 'City' },
  { name: 'Brampton', type: 'City' },
  { name: 'Markham', type: 'City' },
  { name: 'Vaughan', type: 'City' },
  { name: 'Richmond Hill', type: 'City' },
  { name: 'Oakville', type: 'City' },
  
  // Vancouver Cities/Areas (Added)
  { name: '温哥华 (Vancouver)', type: 'City' },
  { name: '列治文 (Richmond)', type: 'City' },
  { name: '本拿比 (Burnaby)', type: 'City' },
  { name: '素里 (Surrey)', type: 'City' },
  { name: '西温 (West Vancouver)', type: 'City' },
  { name: '高贵林 (Coquitlam)', type: 'City' },

  // Streets
  { name: 'Gerrard Street East', type: 'Street' },
  { name: 'Gerrard Street West', type: 'Street' },
  { name: 'Granville Street', type: 'Street' }, // Van
  { name: 'Garden Avenue', type: 'Street' },
  { name: 'Glencairn Avenue', type: 'Street' },
  { name: 'Greenwood Avenue', type: 'Street' },
  { name: 'Guildwood Parkway', type: 'Street' },
  { name: 'Yonge Street', type: 'Street' },
  { name: 'Queen Street West', type: 'Street' },
  { name: 'King Street West', type: 'Street' },
  { name: 'Dundas Street', type: 'Street' },
  { name: 'Bloor Street', type: 'Street' },
  { name: 'Cambie Street', type: 'Street' }, // Van
  { name: 'No. 3 Road', type: 'Street' }, // Richmond
];

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({ onClose, onSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(MOCK_LOCATIONS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = MOCK_LOCATIONS.filter(item => 
      item.name.toLowerCase().includes(lowerQuery)
    );
    setResults(filtered);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 flex flex-col text-gray-900">
      {/* Header with Search Input */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-100 rounded-full flex items-center px-4 py-3">
            <Search size={20} className="text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-transparent border-none outline-none text-gray-900 ml-2 placeholder-gray-400 text-base font-medium"
              placeholder="输入城市或街道名称"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1">
                <X size={18} className="text-gray-500" />
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-900 font-medium text-base whitespace-nowrap px-1"
          >
            取消
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Location Option */}
        {query === '' && (
           <div 
             className="px-6 py-5 flex items-center gap-4 border-b border-gray-100 active:bg-gray-100 cursor-pointer"
             onClick={() => onSelect('多伦多 (当前位置)')}
           >
             <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-800 shrink-0">
               <Navigation size={20} className="fill-current" />
             </div>
             <div>
               <p className="font-bold text-gray-900 text-base">定位当前位置</p>
               <p className="text-sm text-gray-500 mt-1">点击获取精准定位</p>
             </div>
           </div>
        )}

        {/* Results List */}
        <div className="bg-white">
          {results.map((item, index) => (
            <div 
              key={index}
              onClick={() => onSelect(item.name)}
              className="px-6 py-5 flex items-center gap-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-base">
                        {item.name}
                    </p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {item.type}
                    </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">Canada</p>
              </div>
            </div>
          ))}
          
          {query !== '' && results.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-base">
              <p>未找到 "{query}" 相关位置</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
