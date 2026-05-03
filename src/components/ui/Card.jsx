import { cn } from '../../lib/cn'

function Card({ children, className, title, subtitle }) {
  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-slate-100', className)}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card