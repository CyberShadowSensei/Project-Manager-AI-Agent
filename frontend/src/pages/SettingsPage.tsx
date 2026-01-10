import { useState, useEffect, useRef } from 'react'
import { User, Bell, Shield, Hash, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react'
import { inboxService } from '../services/api'

export const SettingsPage = () => {
  // Lazy Initialization for local storage persistence
  const [emailNotifications, setEmailNotifications] = useState(() => {
    const saved = localStorage.getItem('emailNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [pushNotifications, setPushNotifications] = useState(() => {
    const saved = localStorage.getItem('pushNotifications');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [twoFactorAuth, setTwoFactorAuth] = useState(() => {
    const saved = localStorage.getItem('twoFactorAuth');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(() => {
    const savedProfilePicture = localStorage.getItem('profilePicture');
    return savedProfilePicture !== null ? savedProfilePicture : null;
  });
  const [isSlackConnected, setIsSlackConnected] = useState(false);
  const [checkingSlack, setCheckingSlack] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkSlack = async () => {
        try {
            const res = await inboxService.getMessages();
            setIsSlackConnected(res.data.connected);
        } catch (err) {
            console.error("Slack check failed", err);
        } finally {
            setCheckingSlack(false);
        }
    };
    checkSlack();
  }, []);



  
    // Persist profile picture
    useEffect(() => {
      if (profilePicture) {
        localStorage.setItem('profilePicture', profilePicture)
      }
    }, [profilePicture])
  
    const toggleEmail = () => {
      const newValue = !emailNotifications;
      setEmailNotifications(newValue);
      localStorage.setItem('emailNotifications', JSON.stringify(newValue));
    }
  
    const togglePush = () => {
      const newValue = !pushNotifications;
      setPushNotifications(newValue);
      localStorage.setItem('pushNotifications', JSON.stringify(newValue));
    }
  
    const toggle2FA = () => {
      const newValue = !twoFactorAuth;
      setTwoFactorAuth(newValue);
      localStorage.setItem('twoFactorAuth', JSON.stringify(newValue));
    }
  
    const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setProfilePicture(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
  
          {/* Profile */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <div className="text-[17px] font-semibold">Profile Settings</div>
                <div className="text-[11px] text-muted">Manage your personal information</div>
              </div>
            </div>
  
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted">Profile Picture</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePictureUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className="text-sm text-primary hover:underline">
                  Upload Picture
                </button>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted">Display Name</span>
                <span className="text-sm">User</span>
              </div>
  
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-sm text-muted">Email</span>
                <span className="text-sm">user@example.com</span>
              </div>
  
              {/* Language (English only) */}
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted">Language</span>
                <span className="text-sm">English</span>
              </div>
            </div>
          </div>

          {/* Slack Integration */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden">
                  <Hash className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-[17px] font-semibold">Slack Integration</div>
                  <div className="text-[11px] text-muted">Sync with your workspace</div>
                </div>
              </div>
              
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                checkingSlack ? 'bg-white/5 text-muted animate-pulse' :
                isSlackConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {checkingSlack ? 'Checking...' : isSlackConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-muted leading-relaxed">
                Connect your workspace to enable real-time message syncing in your Inbox and push-to-Slack emergency alerts.
              </p>
              
              {!isSlackConnected && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-[10px] font-black uppercase text-primary tracking-widest">Setup Instructions</div>
                  <ol className="text-[10px] text-muted list-decimal list-inside space-y-1">
                    <li>Create an app at <span className="text-white italic">api.slack.com/apps</span></li>
                    <li>Add <span className="text-white">chat:write</span> and <span className="text-white">channels:history</span> scopes</li>
                    <li>Install the app and copy the Bot User OAuth Token</li>
                    <li>Set <span className="text-white">SLACK_BOT_TOKEN</span> in your environment</li>
                  </ol>
                  <a 
                    href="https://api.slack.com/apps" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-bold mt-1"
                  >
                    Slack API Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {isSlackConnected && (
                <div className="flex items-center gap-2 text-[10px] text-green-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    System is correctly synchronized with your workspace.
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
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
  
                                {[
  
                                  ['Email Notifications', emailNotifications, toggleEmail],
  
                                  ['Push Notifications', pushNotifications, togglePush]
  
                                ].map(([label, value, action]) => (              <div key={label} className="flex justify-between py-2">
                <span className="text-sm text-muted">{label}</span>
                <button
                  onClick={action}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                    value ? 'bg-primary' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                      value ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            )
          )}
        </div>

        {/* Security */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Security</div>
              <div className="text-[11px] text-muted">Password and privacy</div>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-sm text-muted hover:bg-white/8 transition-all"
          >
            Change Password
          </button>

          <div className="flex justify-between py-2 mt-3">
            <span className="text-sm text-muted">Two-Factor Authentication</span>
            <button
              onClick={toggle2FA}
              className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                twoFactorAuth ? 'bg-primary' : 'bg-white/10'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                  twoFactorAuth ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3">Testing & Development</h4>
            <button
              onClick={() => {
                localStorage.removeItem('pm_ai_onboarding_v1');
                localStorage.removeItem('pm_ai_onboarding_v2');
                localStorage.removeItem('pm_ai_onboarding_v3');
                localStorage.removeItem('pm_ai_onboarding_v4');
                localStorage.removeItem('pm_ai_onboarding_v5');
                localStorage.removeItem('pm_ai_onboarding_v6');
                localStorage.removeItem('pm_ai_onboarding_v7');
                alert('Onboarding tour reset! Refresh the page to see it again.');
              }}
              className="w-full px-4 py-2 rounded-lg border border-primary/30 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/10 transition-all"
            >
              Reset Onboarding Tour
            </button>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="rounded-2xl bg-[#0F111A] border border-white/10 px-8 py-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-white">Change Password</h2>
            <input className="w-full mb-3 px-4 py-2 rounded-lg bg-white/5 text-white outline-none focus:border-primary border border-transparent" type="password" placeholder="Current Password" />
            <input className="w-full mb-3 px-4 py-2 rounded-lg bg-white/5 text-white outline-none focus:border-primary border border-transparent" type="password" placeholder="New Password" />
            <input className="w-full mb-4 px-4 py-2 rounded-lg bg-white/5 text-white outline-none focus:border-primary border border-transparent" type="password" placeholder="Confirm New Password" />
            <div className="flex gap-2">
                <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                Cancel
                </button>
                <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white transition-colors"
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