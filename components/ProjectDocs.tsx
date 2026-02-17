
import React from 'react';
import { BookOpen, Terminal, Layers, ShieldCheck, Database, Layout } from 'lucide-react';

const ProjectDocs: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="bg-red-600 p-8 rounded-[2rem] text-white">
        <h2 className="text-3xl font-black mb-2">Project Dossier</h2>
        <p className="text-sm opacity-90">SheroSafe Technical Specifications</p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="text-red-600" size={20} />
          <h3 className="font-bold">Abstract</h3>
        </div>
        <div className="glass p-6 rounded-[2rem]">
          <p className="text-sm opacity-80 leading-relaxed">
            SheroSafe is an AI-enhanced personal safety ecosystem designed to bridge the gap between emergency and response. Using Gemini 2.5 Flash's Maps Grounding, it identifies safe corridors and emergency hubs in real-time based on the user's specific coordinates.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Terminal className="text-red-600" size={20} />
          <h3 className="font-bold">System Architecture</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-4 rounded-3xl flex flex-col gap-2">
             <Layout size={20} className="text-blue-500" />
             <span className="font-bold text-xs">Frontend</span>
             <p className="text-[10px] opacity-60">React 18 + Tailwind Mobile-First UI</p>
          </div>
          <div className="glass p-4 rounded-3xl flex flex-col gap-2">
             <ShieldCheck size={20} className="text-green-500" />
             <span className="font-bold text-xs">AI Layer</span>
             <p className="text-[10px] opacity-60">Gemini 2.5 + Google Maps Tool</p>
          </div>
          <div className="glass p-4 rounded-3xl flex flex-col gap-2">
             <Layers size={20} className="text-purple-500" />
             <span className="font-bold text-xs">Services</span>
             <p className="text-[10px] opacity-60">Web Audio API + Geolocation API</p>
          </div>
          <div className="glass p-4 rounded-3xl flex flex-col gap-2">
             <Database size={20} className="text-amber-500" />
             <span className="font-bold text-xs">Persistence</span>
             <p className="text-[10px] opacity-60">Local Storage + Cloud Sync (Sim)</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <Terminal className="text-red-600" size={20} />
          <h3 className="font-bold">Development Roadmap</h3>
        </div>
        <div className="space-y-2">
          {[
            { w: 'W1', t: 'UI Prototype', d: 'Design system, Mobile-first layouts' },
            { w: 'W2', t: 'Core Systems', d: 'SOS Logic, Geolocation, Contacts CRUD' },
            { w: 'W3', t: 'AI Integration', d: 'Gemini Maps Grounding, Safety Analysis' },
            { w: 'W4', t: 'Hardening', d: 'Encryption, Audio Alarms, Final Docs' },
          ].map((item, i) => (
            <div key={i} className="glass p-4 rounded-3xl flex gap-4">
               <span className="bg-red-100 dark:bg-red-900/30 text-red-600 font-black text-xs h-8 w-8 flex items-center justify-center rounded-lg shrink-0">{item.w}</span>
               <div>
                 <h4 className="text-sm font-bold">{item.t}</h4>
                 <p className="text-[10px] opacity-50">{item.d}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-zinc-900 p-8 rounded-[2rem] text-white text-center">
         <h4 className="font-bold mb-2">Resume Highlight</h4>
         <p className="text-xs opacity-60 italic leading-relaxed">
           "Architected a mobile-first safety platform utilizing Google Gemini API for real-time risk assessment and location grounding. Implemented emergency fail-safe protocols with 0.5s latency response times."
         </p>
      </div>
    </div>
  );
};

export default ProjectDocs;
