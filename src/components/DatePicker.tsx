import React from 'react';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    onChange(newDate);
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = formatDateForInput(tomorrow);

  return (
    <div className="space-y-6">
      <input
        type="date"
        value={formatDateForInput(value)}
        onChange={handleDateChange}
        min={minDate}
        className="w-full px-6 py-4 rounded-2xl bg-white/[0.04] border border-white/[0.12] text-starlight-100 focus:ring-2 focus:ring-cosmos-500/50 focus:border-transparent transition-all font-serif"
      />
      
      {/* Quick Select Options */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'One Week', days: 7, whisper: 'A week\'s journey ahead' },
          { label: 'One Month', days: 30, whisper: 'When the moon returns' },
          { label: 'Six Months', days: 180, whisper: 'Half a year\'s wisdom' },
          { label: 'One Year', days: 365, whisper: 'A full cycle of seasons' }
        ].map(option => {
          const quickDate = new Date();
          quickDate.setDate(quickDate.getDate() + option.days);
          
          return (
            <button
              key={option.label}
              onClick={() => onChange(quickDate)}
              className="group relative px-4 py-2 text-sm font-serif bg-white/[0.06] text-starlight-300 rounded-xl hover:bg-white/[0.12] hover:text-starlight-200 transition-all duration-300 border border-white/[0.08]"
            >
              {option.label}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-whisper text-xs whitespace-nowrap">
                  {option.whisper}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      <p className="text-whisper">
        Your memory will awaken on <em>{value.toLocaleDateString()}</em> when midnight kisses the earth
      </p>
    </div>
  );
};

export default DatePicker;