import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search } from 'lucide-react';
import { searchCities } from '../services/api';
import type { CitySearchResult } from '../types';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue with Vite
import L from 'leaflet';

// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CitySearchProps {
  onCitySelect: (city: CitySearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({ 
  onCitySelect, 
  placeholder = 'Search for a city...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const cities = await searchCities(query);
      setResults(cities);
      setLoading(false);
      setIsOpen(true);
    };

    const debounce = setTimeout(fetchCities, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (city: CitySearchResult) => {
    setSelectedCity(city);
    setQuery(city.name);
    setIsOpen(false);
    onCitySelect(city);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative" ref={wrapperRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {results.map((city, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(city)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium text-slate-900">{city.name}</div>
                <div className="text-sm text-slate-500">{city.country}</div>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {selectedCity && (
        <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-300">
          <MapContainer
            center={[selectedCity.lat, selectedCity.lon]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            key={`${selectedCity.lat}-${selectedCity.lon}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[selectedCity.lat, selectedCity.lon]}>
              <Popup>
                <strong>{selectedCity.name}</strong><br/>
                {selectedCity.country}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};
