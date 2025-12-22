export const AssetsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[26px] leading-7 font-semibold mb-2">Assets</h1>
        <p className="text-muted text-sm">All uploaded files and resources</p>
      </div>
      
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-8 py-16 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div className="text-lg font-medium text-white mb-2">No assets yet</div>
          <div className="text-sm text-muted">Upload files to get started</div>
        </div>
      </div>
    </div>
  )
}

