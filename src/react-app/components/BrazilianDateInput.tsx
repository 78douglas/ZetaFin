import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface BrazilianDateInputProps {
  value: string; // Formato ISO (YYYY-MM-DD)
  onChange: (value: string) => void; // Retorna formato ISO
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function BrazilianDateInput({
  value,
  onChange,
  placeholder = "DD/MM/AAAA",
  className = "",
  label,
  required = false,
  disabled = false
}: BrazilianDateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Converter ISO para formato brasileiro
  const isoToBrazilian = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  // Converter formato brasileiro para ISO
  const brazilianToIso = (brazilianDate: string): string => {
    if (!brazilianDate) return '';
    try {
      const cleanDate = brazilianDate.replace(/\D/g, '');
      if (cleanDate.length !== 8) return '';
      
      const day = cleanDate.substring(0, 2);
      const month = cleanDate.substring(2, 4);
      const year = cleanDate.substring(4, 8);
      
      // Validar data
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (date.getFullYear() !== parseInt(year) || 
          date.getMonth() !== parseInt(month) - 1 || 
          date.getDate() !== parseInt(day)) {
        return '';
      }
      
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Formatar entrada enquanto digita
  const formatInput = (input: string): string => {
    const numbers = input.replace(/\D/g, '');
    let formatted = '';
    
    for (let i = 0; i < numbers.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += '/';
      }
      formatted += numbers[i];
    }
    
    return formatted;
  };

  // Atualizar display quando value mudar
  useEffect(() => {
    setDisplayValue(isoToBrazilian(value));
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatInput(inputValue);
    setDisplayValue(formatted);
    
    // Se a data estiver completa, converter para ISO e chamar onChange
    if (formatted.length === 10) {
      const isoDate = brazilianToIso(formatted);
      if (isoDate) {
        onChange(isoDate);
      }
    } else if (inputValue === '') {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Validar e corrigir a data ao sair do campo
    if (displayValue.length === 10) {
      const isoDate = brazilianToIso(displayValue);
      if (isoDate) {
        onChange(isoDate);
        setDisplayValue(isoToBrazilian(isoDate));
      } else {
        // Data inválida, limpar
        setDisplayValue('');
        onChange('');
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
          maxLength={10}
        />
      </div>
    </div>
  );
}