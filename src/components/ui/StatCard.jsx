import Card from './Card'
import { cn } from '../../lib/cn'

function StatCard({ label, value, icon: Icon, trend, color }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className={cn('p-3 rounded-xl', color)}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full',
              trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            )}
          >
            {trend}
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h2 className="text-2xl font-bold text-slate-900 mt-1">{value}</h2>
      </div>
    </Card>
  )
}

export default StatCard