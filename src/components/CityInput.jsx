"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";

export default function CityInput({ label, value, onChange, onCoordinateSelect, placeholder, id }) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Seek if user typed more than 3 chars and list is open
      if (value && value.length > 3 && open) {
        setLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5&countrycodes=br`);
          const data = await res.json();
          setSuggestions(data);
        } catch (err) {
          console.error("Erro na busca de localização", err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [value, open]);

  const handleChange = (val) => {
    onChange(val);
    setOpen(true);
  };

  const handleSelect = (item) => {
    const addr = item.address || {};
    // Extract a nice readable name
    const itemName = item.display_name.split(',')[0] + (addr.state ? ` - ${addr.state}` : '');
    
    onChange(itemName);
    if (onCoordinateSelect) {
      onCoordinateSelect({ lat: parseFloat(item.lat), lon: parseFloat(item.lon) });
    }
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="relative" ref={ref}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-ink-200 mb-1.5">{label}</label>}
      <div className="relative">
        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onFocus={() => setOpen(true)}
          className="input-field input-icon w-full pr-10"
          placeholder={placeholder || "Digite o local..."}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dark-200 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 text-sm text-ink-200 hover:bg-brand-500/20 hover:text-white border-b border-white/5 last:border-0 transition flex flex-col items-start"
              >
                <div className="flex items-center gap-2 w-full">
                  <MapPin size={14} className="text-ink-400 shrink-0" /> 
                  <span className="font-semibold text-white truncate">{item.display_name.split(',')[0]}</span>
                </div>
                <span className="text-xs text-ink-300 ml-5 truncate w-[90%]">{item.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
