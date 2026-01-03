import React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost', size?: 'sm' | 'md' | 'lg' }>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    // These are default (Neutral) styles. The adaptive UI often overrides these classes completely.
    const variants = {
      primary: "bg-[#D7FF00] text-[#0D0D0D] hover:bg-[#C7FF3D] focus:ring-[#D7FF00] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(215,255,0,0.3)] hover:shadow-[0_0_25px_rgba(215,255,0,0.5)]",
      secondary: "bg-transparent text-white border border-white/20 hover:bg-white/10 focus:ring-[#D7FF00] font-bold uppercase tracking-wider",
      danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 focus:ring-red-500",
      ghost: "bg-transparent text-gray-400 hover:text-[#D7FF00] hover:bg-white/5",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg",
    };

    // Note: className prop comes last to allow overrides
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ className = '', label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-300 mb-1 uppercase tracking-wide">{label}</label>}
        <input
          ref={ref}
          className={`block w-full rounded-xl border-white/10 border bg-[#2B2F23] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#D7FF00] focus:outline-none focus:ring-1 focus:ring-[#D7FF00] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export const Card = ({ children, className = '', noPadding = false }: { children?: React.ReactNode; className?: string; noPadding?: boolean }) => {
  return (
    <div className={`bg-[#2B2F23] border border-white/10 rounded-3xl shadow-lg overflow-hidden ${className}`}>
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export const Badge = ({ children, color = 'blue' }: { children?: React.ReactNode; color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-slate-100 text-slate-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};