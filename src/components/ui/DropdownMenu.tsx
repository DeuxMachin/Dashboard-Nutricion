import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

interface DropdownMenuProps {
  options: DropdownOption[];
  className?: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Detectar si el menú se corta en la parte inferior
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = 300; // Altura aproximada del menú
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
        setPosition('top');
      } else {
        setPosition('bottom');
      }
    }
  }, [isOpen]);

  const getColorClasses = (color: string = 'default') => {
    switch (color) {
      case 'danger':
        return 'text-red-700 hover:bg-red-50';
      case 'success':
        return 'text-green-700 hover:bg-green-50';
      case 'warning':
        return 'text-amber-700 hover:bg-amber-50';
      default:
        return 'text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Botón de tres puntos */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-white rounded-full hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="sr-only">Abrir menú de opciones</span>
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Menú dropdown */}
      {isOpen && (
        <div 
          ref={menuRef}
          className={`absolute right-0 z-50 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-100 origin-top-right ${
            position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!option.disabled) {
                    option.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={option.disabled}
                className={`
                  w-full flex items-center px-4 py-3 text-sm transition-colors duration-150
                  ${option.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : getColorClasses(option.color)
                  }
                `}
                role="menuitem"
              >
                <span className="flex-shrink-0 w-4 h-4 mr-3">
                  {option.icon}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
