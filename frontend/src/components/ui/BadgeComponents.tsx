import { CheckCircle, AlertCircle, Clock, Zap, AlertTriangle, Minus } from 'lucide-react'

interface StatusBadgeProps {
  status: 'To Do' | 'In Progress' | 'Done'
}

interface PriorityBadgeProps {
  priority: 'Low' | 'Medium' | 'High'
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    'To Do': {
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
      icon: Clock,
      label: 'To Do'
    },
    'In Progress': {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      icon: Zap,
      label: 'In Progress'
    },
    'Done': {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      icon: CheckCircle,
      label: 'Done'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  )
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  const priorityConfig = {
    'Low': {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      icon: Minus,
      label: 'Low'
    },
    'Medium': {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      icon: AlertCircle,
      label: 'Medium'
    },
    'High': {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      icon: AlertTriangle,
      label: 'High'
    }
  }

  const config = priorityConfig[priority]
  const Icon = config.icon

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${config.bg} ${config.text}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  )
}
