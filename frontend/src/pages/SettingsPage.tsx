import { useState } from 'react'
import { User, Bell, Shield, Palette } from 'lucide-react'

export const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [language, setLanguage] = useState<'english' | 'hindi'>('english')
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleChangePassword = () => {
    setShowPasswordModal(true)
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Profile Settings</div>
              <div className="text-[11px] text-muted">Manage your personal information</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-muted">Display Name</span>
              <span className="text-sm">User</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <span className="text-sm text-muted">Email</span>
              <span className="text-sm">user@example.com</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Bell className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Notifications</div>
              <div className="text-[11px] text-muted">Configure alert preferences</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">Email Notifications</span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ease-in-out ${
                  emailNotifications ? 'bg-primary' : 'bg-white/10'
                } hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    emailNotifications ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">Push Notifications</span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ease-in-out ${
                  pushNotifications ? 'bg-primary' : 'bg-white/10'
                } hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    pushNotifications ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Security</div>
              <div className="text-[11px] text-muted">Password and privacy settings</div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={handleChangePassword}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-sm text-muted hover:bg-white/8 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all duration-200 ease-in-out"
            >
              Change Password
            </button>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">Two-Factor Authentication</span>
              <button
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ease-in-out ${
                  twoFactorAuth ? 'bg-primary' : 'bg-white/10'
                } hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ease-in-out ${
                    twoFactorAuth ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Palette className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Appearance</div>
              <div className="text-[11px] text-muted">Theme and display options</div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">Theme</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    theme === 'dark'
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 border border-white/[0.06] text-muted hover:bg-white/8'
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    theme === 'light'
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 border border-white/[0.06] text-muted hover:bg-white/8'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted">Language</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('english')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    language === 'english'
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 border border-white/[0.06] text-muted hover:bg-white/8'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('hindi')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    language === 'hindi'
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'bg-white/5 border border-white/[0.06] text-muted hover:bg-white/8'
                  }`}
                >
                  Hindi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={handleClosePasswordModal}>
          <div
            className="rounded-2xl bg-[rgba(0,0,0,0.8)] backdrop-blur-2xl border border-white/[0.06] px-8 py-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted block mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted block mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm text-muted block mb-2">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClosePasswordModal}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-sm text-muted hover:bg-white/8 hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
              >
                Cancel
              </button>
              <button
                onClick={handleClosePasswordModal}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 ease-in-out"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

