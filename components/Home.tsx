
import { 
  ShieldAlert, MapPin, Mic, Info, Bell, Radio, Signal, Navigation2, 
  Loader2, Share2, Check, User, PhoneCall, Zap, Ghost, Timer, 
  Eye, AudioLines, Heart, Smartphone, X, AlertCircle, ShieldCheck,
  MessageCircle
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import MapView from './MapView';
import { Contact, SafetySettings } from '../types';

interface HomeProps {
  isSOSActive: boolean;
  triggerSOS: (type?: any) => void;
  cancelSOS: () => void;
  location: { lat: number; lng: number } | null;
  permissionsGranted: { mic: boolean, loc: boolean };
  requestPermissions: () => Promise<boolean>;
  isVoiceTriggerOn: boolean;
  setIsVoiceTriggerOn: (val: boolean) => void;
  shareLocation: (selectedIds: string[]) => void;
  shareViaWhatsApp: (selectedIds: string[]) => void;
  contacts: Contact[];
  settings: SafetySettings;
  setSettings: React.Dispatch<React.SetStateAction<SafetySettings>>;
  checkInTimer: number | null;
  startCheckIn: (seconds: number) => void;
  cancelCheckIn: () => void;
}

const Home: React.FC<HomeProps> = ({ 
  isSOSActive,
  triggerSOS, 
  location, 
  permissionsGranted,
  requestPermissions,
  isVoiceTriggerOn, 
  setIsVoiceTriggerOn,
  shareLocation,
  shareViaWhatsApp,
  contacts,
  settings,
  setSettings,
  checkInTimer,
  startCheckIn,
  cancelCheckIn
}) => {
  const recognitionRef = useRef<any>(null);
  const [sharingStatus, setSharingStatus] = useState<'idle' | 'sms' | 'whatsapp'>('idle');
  const [selectedGuardianIds, setSelectedGuardianIds] = useState<string[]>([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);

  const primaryContact = contacts.find(c => c.isPrimary) || (contacts.length > 0 ? contacts[0] : null);
  const emergencyNumber = primaryContact ? primaryContact.phone : '112';

  useEffect(() => {
    if (selectedGuardianIds.length === 0 && contacts.length > 0) {
      const primary = contacts.find(c => c.isPrimary) || contacts[0];
      setSelectedGuardianIds([primary.id]);
    }
  }, [contacts]);

  // Handle Speech Recognition safely
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isVoiceTriggerOn && !isSOSActive) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('')
          .toLowerCase();

        if (transcript.includes('help')) {
          handleSOSClick();
          setIsVoiceTriggerOn(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          setIsVoiceTriggerOn(false);
          alert("Voice Trigger: Microphone permission was denied.");
        }
      };

      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech Recognition failed to start", e);
      }
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    }

    return () => { if (recognitionRef.current) try { recognitionRef.current.stop(); } catch(e) {} };
  }, [isVoiceTriggerOn, isSOSActive]);

  const handleSOSClick = () => {
    if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 300]);
    triggerSOS();
  };

  const handleCallClick = () => {
    window.location.href = `tel:${emergencyNumber}`;
  };

  const toggleSetting = (key: keyof SafetySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const needsSetup = !permissionsGranted.mic || !permissionsGranted.loc || !location;

  return (
    <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12`}>
      
      {/* System Health Check */}
      {needsSetup && (
        <div className="glass p-5 rounded-[2rem] border-2 border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm">Action Required</h3>
              <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Permissions Incomplete</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!permissionsGranted.mic && <span className="text-[8px] bg-white/50 px-2 py-1 rounded-full border border-amber-200">MIC: BLOCKED</span>}
            {(!permissionsGranted.loc || !location) && <span className="text-[8px] bg-white/50 px-2 py-1 rounded-full border border-amber-200">GPS: OFFLINE</span>}
          </div>
          <button 
            onClick={requestPermissions}
            className="w-full bg-amber-500 text-white text-[10px] font-black py-2 rounded-xl active:scale-95 transition-transform"
          >
            GRANT SYSTEM ACCESS
          </button>
        </div>
      )}

      {/* Dynamic Header Status */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${settings.silentAlarm ? 'bg-zinc-900 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-zinc-500'}`}>
          <Ghost size={12}/> {settings.silentAlarm ? 'Silent Mode On' : 'Loud Alarm Active'}
        </div>
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${settings.autoRecording ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-zinc-500'}`}>
          <AudioLines size={12}/> Evidence Capture
        </div>
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border ${settings.geoFenceEnabled ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-zinc-500'}`}>
          <MapPin size={12}/> Geo-Fence
        </div>
      </div>

      {/* SOS Button Center */}
      <div className="flex flex-col items-center justify-center py-6 relative">
        <div className={`absolute inset-0 blur-[100px] rounded-full transition-colors duration-1000 ${isSOSActive ? 'bg-red-600/40' : 'bg-red-600/10'}`}></div>
        
        <button 
          onClick={handleSOSClick}
          className={`relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.5)] active:scale-90 transition-all duration-300 flex flex-col items-center justify-center border-8 border-red-400/20 group 
            ${isSOSActive ? 'animate-sos scale-110' : ''}`}
        >
          <div className="absolute inset-0 rounded-full border border-white/20 scale-105 group-hover:scale-110 transition-transform"></div>
          <Bell size={44} color="white" className="mb-2" />
          <span className="text-4xl font-black text-white tracking-tighter">S O S</span>
          <span className="text-[9px] text-red-100 font-bold mt-2 uppercase tracking-widest">TAP FOR HELP</span>
        </button>

        {checkInTimer !== null && (
          <div className="absolute -top-4 right-0 bg-blue-600 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce cursor-pointer" onClick={() => setShowCheckInModal(true)}>
            <Timer size={16} />
            <span className="font-black text-sm">{formatTime(checkInTimer)}</span>
          </div>
        )}
      </div>

      {/* Essential Quick Actions */}
      <div className="grid grid-cols-2 gap-3 px-1">
        <button onClick={handleCallClick} className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-amber-500/20 transition-all active:scale-95">
          <PhoneCall size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Call Primary</span>
        </button>
        <button onClick={() => setShowCheckInModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Timer size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Safety Check-In</span>
        </button>
      </div>

      {/* Advanced Safety Suite (Toggles) */}
      <div className="glass p-6 rounded-[2.5rem] space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Zap size={14}/> Safety Suite</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => toggleSetting('silentAlarm')} className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${settings.silentAlarm ? 'bg-zinc-900 text-white border-zinc-800 shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'}`}>
            {settings.silentAlarm ? <Ghost size={20} className="text-purple-400"/> : <Bell size={20}/>}
            <span className="text-[10px] font-bold text-left">Silent Alarm</span>
          </button>
          <button onClick={() => toggleSetting('threatDetection')} className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${settings.threatDetection ? 'bg-green-600 text-white border-green-500 shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'}`}>
            <Signal size={20} className={settings.threatDetection ? 'animate-pulse' : ''}/>
            <span className="text-[10px] font-bold text-left">AI Detection</span>
          </button>
          <button 
            onClick={() => {
              if (!permissionsGranted.mic) {
                requestPermissions().then(granted => {
                  if (granted) setIsVoiceTriggerOn(!isVoiceTriggerOn);
                });
              } else {
                setIsVoiceTriggerOn(!isVoiceTriggerOn);
              }
            }} 
            className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${isVoiceTriggerOn ? 'bg-red-600 text-white border-red-500 shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'}`}
          >
            <Mic size={20}/>
            <span className="text-[10px] font-bold text-left">Voice Key "Help"</span>
          </button>
          <button onClick={() => toggleSetting('geoFenceEnabled')} className={`p-4 rounded-2xl border flex flex-col items-start gap-2 transition-all ${settings.geoFenceEnabled ? 'bg-blue-500 text-white border-blue-400 shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-800'}`}>
            <Navigation2 size={20}/>
            <span className="text-[10px] font-bold text-left">Safe Geo-Fence</span>
          </button>
        </div>
      </div>

      {/* Share Live Location Panel */}
      <div className="glass p-6 rounded-[2.5rem] space-y-4 border border-blue-100/50 dark:border-blue-900/20 shadow-xl shadow-blue-500/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <Share2 size={14} /> Live Route Share
          </h3>
          <span className="text-[10px] opacity-40 font-bold">{selectedGuardianIds.length} Recipient(s)</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {contacts.map(contact => (
            <button key={contact.id} onClick={() => setSelectedGuardianIds(prev => prev.includes(contact.id) ? prev.filter(gid => gid !== contact.id) : [...prev, contact.id])} className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl transition-all border ${selectedGuardianIds.includes(contact.id) ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-white/50 dark:bg-zinc-800/50 text-zinc-500 border-gray-100'}`}>
               <span className="text-xs font-bold">{contact.name}</span>
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => { 
              setSharingStatus('sms'); 
              shareLocation(selectedGuardianIds); 
              setTimeout(() => setSharingStatus('idle'), 2000); 
            }} 
            disabled={!location || selectedGuardianIds.length === 0} 
            className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs transition-all shadow-lg active:scale-95 bg-blue-600 text-white disabled:opacity-30"
          >
            {sharingStatus === 'sms' ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            SMS SHARE
          </button>
          
          <button 
            onClick={() => { 
              setSharingStatus('whatsapp'); 
              shareViaWhatsApp(selectedGuardianIds); 
              setTimeout(() => setSharingStatus('idle'), 2000); 
            }} 
            disabled={!location || selectedGuardianIds.length === 0} 
            className="flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-xs transition-all shadow-lg active:scale-95 bg-green-600 text-white disabled:opacity-30"
          >
            {sharingStatus === 'whatsapp' ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
            WHATSAPP
          </button>
        </div>
        <p className="text-[9px] text-center opacity-40 uppercase font-black">Route syncs with GPS every 2.5 seconds</p>
      </div>

      {location && <MapView lat={location.lat} lng={location.lng} title="Active Safety Perimeter" />}

      {/* Threat Detection Simulation Card */}
      {settings.threatDetection && (
        <div className="bg-zinc-900 p-6 rounded-[2rem] text-white flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-green-500 animate-pulse">SYSTEMS ONLINE</span>
              <Signal size={14} className="text-green-500" />
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                 <Heart size={16} className="text-red-500 animate-pulse" />
                 <div><p className="text-[8px] opacity-40 uppercase">Heart Rate</p><p className="text-xs font-bold">72 BPM</p></div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                 <Smartphone size={16} className="text-blue-500" />
                 <div><p className="text-[8px] opacity-40 uppercase">Motion</p><p className="text-xs font-bold">Stable</p></div>
              </div>
           </div>
           <p className="text-[10px] opacity-40 italic">AI is analyzing motion patterns and biometrics for automatic threat detection.</p>
        </div>
      )}

      {/* Safety Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
           <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black">Safety Check-In</h3>
                 <button onClick={() => setShowCheckInModal(false)}><X size={24}/></button>
              </div>
              <p className="text-sm opacity-60">Set a timer for when you expect to be safe. If you don't cancel it, SheroSafe triggers an SOS alert automatically.</p>
              
              {checkInTimer === null ? (
                <div className="grid grid-cols-2 gap-3">
                  {[5, 10, 30, 60].map(min => (
                    <button key={min} onClick={() => { startCheckIn(min * 60); setShowCheckInModal(false); }} className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all">
                      {min} Minutes
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="text-5xl font-black text-center py-6 text-blue-600">{formatTime(checkInTimer)}</div>
                   <button onClick={() => { cancelCheckIn(); setShowCheckInModal(false); }} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-green-500/20 uppercase tracking-tighter">I AM SAFE NOW</button>
                   <p className="text-[10px] text-center opacity-40 uppercase font-bold">Guardian alert in {formatTime(checkInTimer)}</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Home;
