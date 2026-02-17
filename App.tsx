
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  Shield, 
  Users, 
  MapPin, 
  Clock, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Moon,
  Sun,
  Signal,
  AlertCircle
} from 'lucide-react';
import { AppTab, Contact, AlertLog, SafetySettings } from './types';
import Home from './components/Home';
import Contacts from './components/Contacts';
import NearbyHelpView from './components/NearbyHelpView';
import History from './components/History';
import ProjectDocs from './components/ProjectDocs';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState<{mic: boolean, loc: boolean}>({ mic: false, loc: false });
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Mom', phone: '+1234567890', relationship: 'Mother', isPrimary: true },
    { id: '2', name: 'Sister', phone: '+1987654321', relationship: 'Sister', isPrimary: false }
  ]);
  const [history, setHistory] = useState<AlertLog[]>([]);
  const [isAudioAlarmOn, setIsAudioAlarmOn] = useState(false);
  const [isVoiceTriggerOn, setIsVoiceTriggerOn] = useState(false);
  
  // Advanced Features State
  const [settings, setSettings] = useState<SafetySettings>({
    silentAlarm: false,
    autoRecording: true,
    threatDetection: false,
    geoFenceEnabled: false,
    safeRadius: 500
  });

  const [checkInTimer, setCheckInTimer] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const checkInIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    // Check for initial permissions
    if ('geolocation' in navigator) {
      navigator.permissions?.query({ name: 'geolocation' as any }).then(status => {
        setPermissionsGranted(prev => ({ ...prev, loc: status.state === 'granted' }));
        status.onchange = () => setPermissionsGranted(prev => ({ ...prev, loc: status.state === 'granted' }));
      });
    }
  }, []);

  const requestAllPermissions = async () => {
    try {
      // Request Location
      const loc = await new Promise<GeolocationPosition>((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      
      // Request Microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, just checking permission
      
      setPermissionsGranted({ mic: true, loc: true });
      return true;
    } catch (err) {
      console.error("Permission request failed", err);
      alert("Microphone or Location access was denied. Please enable them in your browser settings for full safety features.");
      return false;
    }
  };

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(newLoc);
          setPermissionsGranted(prev => ({ ...prev, loc: true }));
        },
        (err) => {
          console.error(err);
          setPermissionsGranted(prev => ({ ...prev, loc: false }));
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Audio Evidence Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("Recording saved locally as blob.");
      };
      mediaRecorderRef.current.start();
      setPermissionsGranted(prev => ({ ...prev, mic: true }));
    } catch (err: any) {
      console.error("Recording failed", err);
      setPermissionsGranted(prev => ({ ...prev, mic: false }));
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
        alert("Recording Failed: Microphone permission was dismissed or denied. Please grant access to record evidence during SOS.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const triggerSOS = (type: 'SOS' | 'Voice' | 'Manual' | 'Check-In' = 'SOS') => {
    setIsSOSActive(true);
    
    // Silent mode vs Loud mode
    if (!settings.silentAlarm && isAudioAlarmOn) {
      playSiren();
    }
    
    if (settings.autoRecording) {
      startRecording();
    }
    
    const newLog: AlertLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      location: location || { lat: 0, lng: 0 },
      type: type
    };
    setHistory(prev => [newLog, ...prev]);

    if (contacts.length > 0) {
      sendSMSIntent(contacts, location, true, type === 'Check-In');
    }
  };

  const sendSMSIntent = (targetContacts: Contact[], loc: {lat: number, lng: number} | null, isEmergency: boolean = true, isCheckIn: boolean = false) => {
    if (targetContacts.length === 0) return;
    const mapsLink = loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : 'Location unavailable';
    const prefix = isCheckIn ? 'SheroSafe: Missed Check-In Alert!' : (isEmergency ? 'SheroSafe EMERGENCY! I need help.' : 'SheroSafe: Live location shared.');
    const message = encodeURIComponent(`${prefix} My location: ${mapsLink}`);
    const phones = targetContacts.map(c => c.phone).join(',');
    window.location.href = `sms:${phones}?body=${message}`;
  };

  const sendWhatsAppIntent = (targetContacts: Contact[], loc: {lat: number, lng: number} | null) => {
    if (!loc) return;
    const mapsLink = `https://www.google.com/maps?q=${loc.lat},${loc.lng}`;
    const message = encodeURIComponent(`🚨 SheroSafe Live Route Share: I am currently on the move and want you to track my route for safety. Track me here: ${mapsLink}`);
    
    // If only one person selected, target them directly. Otherwise, open general WhatsApp share.
    const url = targetContacts.length === 1 
      ? `https://wa.me/${targetContacts[0].phone.replace(/\D/g, '')}?text=${message}`
      : `https://wa.me/?text=${message}`;
    
    window.open(url, '_blank');
  };

  const startCheckIn = (seconds: number) => {
    setCheckInTimer(seconds);
    if (checkInIntervalRef.current) clearInterval(checkInIntervalRef.current);
    checkInIntervalRef.current = window.setInterval(() => {
      setCheckInTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(checkInIntervalRef.current!);
          if (prev === 1) triggerSOS('Check-In');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCheckIn = () => {
    if (checkInIntervalRef.current) clearInterval(checkInIntervalRef.current);
    setCheckInTimer(null);
  };

  const cancelSOS = () => {
    setIsSOSActive(false);
    stopSiren();
    stopRecording();
  };

  // Audio Siren
  const audioContext = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  const playSiren = () => {
    if (!audioContext.current) audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioContext.current;
    oscillator.current = ctx.createOscillator();
    gainNode.current = ctx.createGain();
    oscillator.current.type = 'sine';
    oscillator.current.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.current.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 1.5);
    oscillator.current.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 3);
    oscillator.current.loop = true;
    gainNode.current.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.current.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
    oscillator.current.connect(gainNode.current);
    gainNode.current.connect(ctx.destination);
    oscillator.current.start();
  };

  const stopSiren = () => {
    if (oscillator.current && audioContext.current) {
      gainNode.current?.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + 0.2);
      setTimeout(() => { 
        try { oscillator.current?.stop(); } catch(e) {}
        oscillator.current = null;
      }, 200);
    }
  };

  const navItems = [
    { id: AppTab.HOME, icon: <Shield size={24} />, label: 'Home' },
    { id: AppTab.CONTACTS, icon: <Users size={24} />, label: 'Guardians' },
    { id: AppTab.NEARBY, icon: <MapPin size={24} />, label: 'Help' },
    { id: AppTab.HISTORY, icon: <Clock size={24} />, label: 'Logs' },
    { id: AppTab.DOCS, icon: <FileText size={24} />, label: 'Info' },
  ];

  return (
    <div className={`min-h-screen pb-24 flex flex-col ${isDarkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className="p-4 flex justify-between items-center sticky top-0 z-50 glass">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-500/20">
            <Shield size={20} fill="currentColor" />
          </div>
          <h1 className="font-bold text-xl tracking-tight">SheroSafe</h1>
        </div>
        <div className="flex items-center gap-2">
           {settings.threatDetection && (
             <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold animate-pulse">
               <Signal size={12}/> AI MONITORING
             </div>
           )}
          <button 
            onClick={() => setIsAudioAlarmOn(!isAudioAlarmOn)}
            className={`p-2 rounded-full transition-colors ${isAudioAlarmOn ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}
          >
            {isAudioAlarmOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-gray-500">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto">
        {activeTab === AppTab.HOME && (
          <Home 
            isSOSActive={isSOSActive} 
            triggerSOS={triggerSOS} 
            cancelSOS={cancelSOS} 
            location={location}
            permissionsGranted={permissionsGranted}
            requestPermissions={requestAllPermissions}
            isVoiceTriggerOn={isVoiceTriggerOn}
            setIsVoiceTriggerOn={setIsVoiceTriggerOn}
            shareLocation={(ids) => {
              const targets = contacts.filter(c => ids.includes(c.id));
              sendSMSIntent(targets, location, false);
            }}
            shareViaWhatsApp={(ids) => {
              const targets = contacts.filter(c => ids.includes(c.id));
              sendWhatsAppIntent(targets, location);
            }}
            contacts={contacts}
            settings={settings}
            setSettings={setSettings}
            checkInTimer={checkInTimer}
            startCheckIn={startCheckIn}
            cancelCheckIn={cancelCheckIn}
          />
        )}
        {activeTab === AppTab.CONTACTS && <Contacts contacts={contacts} setContacts={setContacts} />}
        {activeTab === AppTab.NEARBY && <NearbyHelpView location={location} />}
        {activeTab === AppTab.HISTORY && <History logs={history} />}
        {activeTab === AppTab.DOCS && <ProjectDocs />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass shadow-2xl z-50 px-4 py-2 flex justify-between items-center border-t border-gray-200 dark:border-zinc-800">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === item.id ? 'text-red-600' : 'text-gray-400 dark:text-zinc-500'}`}>
            {item.icon}
            <span className="text-[10px] font-medium mt-1 uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {isSOSActive && (
        <div className="fixed inset-0 z-[100] bg-red-600/95 flex flex-col items-center justify-center p-8 text-white text-center animate-pulse-slow backdrop-blur-md">
          <div className="animate-sos bg-white/20 p-12 rounded-full mb-8 relative">
            <Bell size={80} className="animate-bounce" />
            {settings.autoRecording && (
               <div className="absolute -top-2 -right-2 bg-white text-red-600 p-2 rounded-full shadow-lg">
                 <Mic size={20} className="animate-pulse" />
               </div>
            )}
          </div>
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Emergency Active</h2>
          <p className="text-xl mb-8 opacity-90 leading-tight">
            SMS sent to {contacts.length} guardians.<br/>
            {settings.autoRecording && "Evidence is being recorded."}
          </p>
          <button onClick={cancelSOS} className="mt-12 bg-white text-red-600 font-black px-12 py-4 rounded-2xl text-xl shadow-2xl active:scale-95 transition-transform uppercase tracking-tighter">
            I AM SAFE NOW
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
