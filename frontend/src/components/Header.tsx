type HeaderProps = {
  pagePath: string
}

const pageTitles: Record<string, { subtitle: string; title: string }> = {
  '/welcome': { subtitle: 'Welcome', title: 'Welcome' },
  '/projects': { subtitle: 'Projects', title: 'Projects' },
  '/dashboard': { subtitle: 'Dashboard', title: 'Welcome' },
  '/assets': { subtitle: 'Assets', title: 'Assets' },
  '/tasks': { subtitle: 'Tasks', title: 'Task Manager' },
  '/inbox': { subtitle: 'Inbox', title: 'Messages' },
  '/reports': { subtitle: 'Reports', title: 'AI Reports & Analytics' },
  '/settings': { subtitle: 'Settings', title: 'Settings' },
}

export const Header = ({ pagePath }: HeaderProps) => {
  const pageInfo = pageTitles[pagePath] || { subtitle: 'Dashboard', title: 'Welcome' }

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted mb-1">{pageInfo.subtitle}</div>
        <div className="text-[26px] leading-7 font-semibold">{pageInfo.title}</div>
      </div>
    </div>
  )
}



