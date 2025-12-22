import { Search } from 'lucide-react'

const messages = [
  {
    name: 'Team Member',
    topic: 'Motion Design',
    tag: 'Work',
    preview: 'I finished the project today. Looking forward to your feedback on the edits I made.',
    team: 'Design',
  },
  {
    name: 'Team Member',
    topic: 'Call about a new project',
    tag: 'Meeting',
    preview: 'At this meeting, we will talk about a key stage in the launch of our new project.',
    team: 'Marketing',
  },
  {
    name: 'Team Member',
    topic: 'New artificial intelligence',
    tag: 'Work',
    preview: 'Today my team and I finished the updates on our artificial intelligence system.',
    team: 'Development',
  },
  {
    name: 'Team Member',
    topic: 'Marketing Strategy',
    tag: 'Work',
    preview: 'Review the new marketing strategy for Q2 launch campaign.',
    team: 'Marketing',
  },
  {
    name: 'Team Member',
    topic: 'Code Review',
    tag: 'Work',
    preview: 'Please review the latest pull request for the authentication module.',
    team: 'Development',
  },
]

type InboxProps = {
  searchQuery: string
  activeTeam?: string | null
}

export const Inbox = ({ searchQuery, activeTeam }: InboxProps) => {
  let filteredMessages = messages
  
  if (activeTeam) {
    filteredMessages = filteredMessages.filter(m => m.team === activeTeam)
  }
  
  if (searchQuery) {
    filteredMessages = filteredMessages.filter(
      (m) =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tag.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] text-muted mb-1">Inboxes</div>
          <div className="text-[17px] font-semibold">Inboxes</div>
        </div>
        <div className="px-2.5 py-1 rounded-full bg-primary/10 text-[10px] text-primary">
          16
        </div>
      </div>
      <div className="mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/[0.06] text-[11px] text-muted">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((m, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-3.5 py-3 flex gap-3 text-[11px] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out"
          >
            <div className="w-9 h-9 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,#FACC15,#F97316_40%,#A855F7_75%)]" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-[12px] font-semibold text-white">{m.name}</div>
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-primary">{m.tag}</span>
              </div>
              <div className="text-[10px] text-muted mb-1">Topic: {m.topic}</div>
              <div className="text-[10px] text-muted line-clamp-2">{m.preview}</div>
            </div>
          </div>
        ))
        ) : (
          <div className="text-center py-8 text-muted text-sm">
            No messages found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  )
}


