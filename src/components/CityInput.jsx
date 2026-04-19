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
      {label && <label htmlFor={id} className="block text-sm font-medium text-brand-900 dark:text-white mb-1.5">{label}</label>}
      <div className="relative">
        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel-500 pointer-events-none" />
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
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-steel-500 pointer-events-none">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-dark-elevated border border-surface-border dark:border-surface-dark-border rounded-2xl shadow-soft-lg max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-brand-500/10 dark:hover:bg-brand-300/10 border-b border-surface-border dark:border-surface-dark-border last:border-0 transition flex flex-col items-start"
              >
                <div className="flex items-center gap-2 w-full">
                  <MapPin size={14} className="text-brand-500 shrink-0" />
                  <span className="font-semibold text-brand-900 dark:text-white truncate">{item.display_name.split(',')[0]}</span>
                </div>
                <span className="text-xs text-steel-500 dark:text-steel-400 ml-5 truncate w-[90%]">{item.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
