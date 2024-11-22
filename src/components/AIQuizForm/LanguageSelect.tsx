import React from 'react';
import type { Language } from '../../types/quiz';
import { Globe2 } from 'lucide-react';

interface LanguageSelectProps {
  value: Language;
  onChange: (value: Language) => void;
}

const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ar', label: 'Arabic' },
];

export default function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Language</label>
      <div className="relative">
        <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Language)}
          className="block w-full pl-10 pr-4 py-2.5 text-gray-900 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}