interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexo-muted mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-nexo-bg border border-nexo-border rounded-lg text-white placeholder-nexo-muted focus:outline-none focus:ring-2 focus:ring-nexo-accent focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  )
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function TextArea({ label, className = '', ...props }: TextAreaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-nexo-muted mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-nexo-bg border border-nexo-border rounded-lg text-white placeholder-nexo-muted focus:outline-none focus:ring-2 focus:ring-nexo-accent focus:border-transparent transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  )
}
