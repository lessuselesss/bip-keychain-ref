import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

// Additional components for compatibility with shadcn-style API
export const SelectTrigger = Select;
export const SelectValue = ({ placeholder, ...props }: { placeholder?: string; children?: ReactNode }) => null;
export const SelectContent = ({ children, ...props }: { children: ReactNode }) => <>{children}</>;
export const SelectItem = ({ value, children, ...props }: { value: string; children: ReactNode }) => (
  <option value={value} {...props}>{children}</option>
);
