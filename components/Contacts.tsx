
import React, { useState } from 'react';
import { UserPlus, Trash2, Star, ShieldCheck, Edit2, Check, X, Phone, Heart } from 'lucide-react';
import { Contact } from '../types';

interface ContactsProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, setContacts }) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRel, setNewRel] = useState('');
  
  // State for editing an existing contact
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRel, setEditRel] = useState('');

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;
    const contact: Contact = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      relationship: newRel,
      isPrimary: contacts.length === 0
    };
    setContacts([...contacts, contact]);
    setNewName('');
    setNewPhone('');
    setNewRel('');
  };

  const removeContact = (id: string) => {
    if (confirm('Remove this guardian? they will no longer receive emergency alerts.')) {
      setContacts(contacts.filter(c => c.id !== id));
    }
  };

  const startEditing = (contact: Contact) => {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
    setEditRel(contact.relationship);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    setContacts(contacts.map(c => 
      c.id === id 
        ? { ...c, name: editName, phone: editPhone, relationship: editRel } 
        : c
    ));
    setEditingId(null);
  };

  const makePrimary = (id: string) => {
    setContacts(contacts.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold">Guardians</h2>
        <p className="text-sm opacity-60">Your trusted circle for emergency alerts</p>
      </div>

      {/* Add New Contact Form */}
      <form onSubmit={addContact} className="glass p-6 rounded-[2rem] space-y-4 shadow-sm border border-white/50">
        <h3 className="font-bold text-sm flex items-center gap-2">
          <UserPlus size={16} className="text-red-600" /> 
          Add New Guardian
        </h3>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-red-500/50 transition-all"
        />
        <div className="grid grid-cols-2 gap-2">
          <input 
            type="tel" 
            placeholder="Phone Number" 
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="w-full bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-red-500/50 transition-all"
          />
          <input 
            type="text" 
            placeholder="Relation (e.g. Brother)" 
            value={newRel}
            onChange={(e) => setNewRel(e.target.value)}
            className="w-full bg-white/50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ring-red-500/50 transition-all"
          />
        </div>
        <button 
          type="submit"
          disabled={!newName || !newPhone}
          className="w-full bg-red-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
        >
          <UserPlus size={18} /> Add Guardian
        </button>
      </form>

      {/* Contacts List */}
      <div className="space-y-3">
        {contacts.map(contact => (
          <div key={contact.id} className={`glass p-4 rounded-[2rem] transition-all border ${editingId === contact.id ? 'ring-2 ring-red-500/30 border-red-200 bg-white shadow-xl' : 'border-white/50 shadow-sm'}`}>
            {editingId === contact.id ? (
              // Inline Edit Mode
              <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Editing Guardian</span>
                  <button onClick={cancelEditing} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm font-bold"
                  placeholder="Name"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="tel" 
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm"
                    placeholder="Phone"
                  />
                  <input 
                    type="text" 
                    value={editRel}
                    onChange={(e) => setEditRel(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-sm"
                    placeholder="Relation"
                  />
                </div>
                <button 
                  onClick={() => saveEdit(contact.id)}
                  className="w-full bg-zinc-900 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 mt-2"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            ) : (
              // Display Mode
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl relative transition-colors ${contact.isPrimary ? 'bg-red-600 text-white shadow-md shadow-red-500/20' : 'bg-gray-100 dark:bg-zinc-800 text-gray-500'}`}>
                    <ShieldCheck size={24} />
                    {contact.isPrimary && (
                      <div className="absolute -top-1 -right-1 bg-amber-400 text-white rounded-full p-0.5 border-2 border-white dark:border-zinc-900">
                        <Star size={10} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm">{contact.name}</h4>
                      {contact.isPrimary && <span className="bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Primary</span>}
                    </div>
                    <p className="text-xs opacity-50 flex items-center gap-1">
                      <Phone size={10} /> {contact.phone} • {contact.relationship}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  {!contact.isPrimary && (
                    <button 
                      onClick={() => makePrimary(contact.id)}
                      className="p-2 text-gray-300 hover:text-amber-500 transition-colors"
                      title="Set as Primary"
                    >
                      <Star size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => startEditing(contact)}
                    className="p-2 text-gray-300 hover:text-blue-500 transition-colors"
                    title="Edit Guardian"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => removeContact(contact.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    title="Remove Guardian"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="p-12 text-center opacity-30 border-2 border-dashed rounded-[2rem] flex flex-col items-center">
            <Heart size={40} className="mb-4 text-gray-400" />
            <p className="font-medium text-sm">No guardians added yet.</p>
            <p className="text-[10px] mt-1">Add someone you trust for maximum safety.</p>
          </div>
        )}
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-[2rem] border border-gray-200 dark:border-zinc-800">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <ShieldCheck size={16} className="text-red-600" /> 
          Safe Guardian Protocol
        </h4>
        <ul className="text-xs space-y-3 opacity-70">
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-sm"></div> 
            <span><strong>Primary Guardian:</strong> Receives priority SOS calls and is the first point of contact for emergency services.</span>
          </li>
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-sm"></div> 
            <span><strong>Live Alerts:</strong> All guardians receive an encrypted SMS with your precise location and battery status.</span>
          </li>
          <li className="flex gap-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 shrink-0 shadow-sm"></div> 
            <span><strong>Smart Updates:</strong> Guardians are notified if you move significantly or if your phone is switched off.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Contacts;
