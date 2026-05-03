import { cn } from '../../lib/cn'

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
        active
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      )}
    >
      <Icon size={20} className={cn(active ? 'text-white' : 'text-slate-400 group-hover:text-slate-900')} />
      {label ? <span className="font-medium">{label}</span> : null}
    </button>
  )
}

export default SidebarItem