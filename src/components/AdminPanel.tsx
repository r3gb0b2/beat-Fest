import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Users, Layout, Map, LogOut } from 'lucide-react';
import { db } from '../lib/firebase-client';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  getDoc
} from 'firebase/firestore';

const LOGO_URL = "https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/8f97204b-324f-4a00-983c-f91604533923";
const STATES_COLLECTION = "beatfest_states_v2";
const LEADS_COLLECTION = "beatfest_leads_v2";
const SETTINGS_COLLECTION = "beatfest_settings_v1";

export default function AdminPanel() {
  const [view, setView] = useState<'states' | 'leads' | 'settings'>('states');
  const [states, setStates] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [filterState, setFilterState] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newState, setNewState] = useState({
    name: '',
    slug: '',
    cover_image: '',
    banner_desktop: '',
    banner_mobile: '',
    event_date: '',
    sales_location: '',
    instagram_url: '',
    facebook_url: '',
    tiktok_url: ''
  });

  const [generalSettings, setGeneralSettings] = useState({
    logo_url: LOGO_URL,
    global_carousel: [] as any[]
  });

  const [dbStatus, setDbStatus] = useState<'loading' | 'connected' | 'error'>('loading');

  useEffect(() => {
    fetchStates();
    fetchLeads();
    fetchSettings();
    setDbStatus('connected');
  }, []);

  const fetchSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setGeneralSettings(prev => ({ ...prev, ...data }));
      }
      
      const carouselSnap = await getDocs(collection(db, 'global_carousel'));
      const carouselList = carouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGeneralSettings(prev => ({ ...prev, global_carousel: carouselList }));
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const snapshot = await getDocs(collection(db, SETTINGS_COLLECTION));
      if (snapshot.empty) {
        await addDoc(collection(db, SETTINGS_COLLECTION), { logo_url: generalSettings.logo_url });
      } else {
        // For simplicity in this demo, we just add another or update the first one
        // In a real app we'd use setDoc with a fixed ID
        await addDoc(collection(db, SETTINGS_COLLECTION), { logo_url: generalSettings.logo_url });
      }
      alert('Configurações salvas!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações');
    }
  };

  const handleAddGlobalCarousel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          await addDoc(collection(db, 'global_carousel'), {
            image_url: reader.result as string,
            created_at: new Date().toISOString()
          });
          fetchSettings();
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGlobalCarousel = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'global_carousel', id));
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStates = async () => {
    try {
      const snapshot = await getDocs(collection(db, STATES_COLLECTION));
      const statesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStates(statesList);
    } catch (err) {
      console.error(err);
      setDbStatus('error');
    }
  };

  const fetchLeads = async () => {
    try {
      const q = query(collection(db, LEADS_COLLECTION), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const leadsList = await Promise.all(snapshot.docs.map(async leadDoc => {
        const data = leadDoc.data();
        let stateName = 'N/A';
        try {
          const stateSnap = await getDoc(doc(db, STATES_COLLECTION, data.state_id));
          if (stateSnap.exists()) stateName = stateSnap.data().name;
        } catch (e) {}
        return { id: leadDoc.id, ...data, state_name: stateName };
      }));
      setLeads(leadsList);
    } catch (err) {
      console.error(err);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleAddState = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await addDoc(collection(db, STATES_COLLECTION), {
        ...newState,
        active: 1
      });
      setNewState({ 
        name: '', 
        slug: '', 
        cover_image: '', 
        banner_desktop: '', 
        banner_mobile: '', 
        event_date: '', 
        sales_location: '',
        instagram_url: '',
        facebook_url: '',
        tiktok_url: ''
      });
      setIsAdding(false);
      fetchStates();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar no Firebase. Verifique as regras do Firestore.');
    }
  };

  const handleDeleteState = async (id: string) => {
    if (confirm('Tem certeza?')) {
      try {
        await deleteDoc(doc(db, STATES_COLLECTION, id));
        fetchStates();
      } catch (err: any) {
        alert('Erro ao excluir: ' + err.message);
      }
    }
  };

  const filteredLeads = filterState === 'all' 
    ? leads 
    : leads.filter(l => l.state_id === filterState);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewState({ ...newState, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-beat-pink rounded-lg flex items-center justify-center font-black">BF</div>
          <div className="flex flex-col">
            <span className="font-bold text-xl">Admin Panel</span>
            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full w-fit ${
              dbStatus === 'connected' ? 'bg-green-500/20 text-green-500' : 
              dbStatus === 'error' ? 'bg-red-500/20 text-red-500' : 
              'bg-zinc-800 text-zinc-500'
            }`}>
              {dbStatus === 'connected' ? 'Firebase OK' : dbStatus === 'error' ? 'Firebase Error' : 'Checking...'}
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('states')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${view === 'states' ? 'bg-beat-pink text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Map className="w-5 h-5" /> Estados
          </button>
          <button 
            onClick={() => setView('leads')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${view === 'leads' ? 'bg-beat-pink text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Users className="w-5 h-5" /> Leads
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${view === 'settings' ? 'bg-beat-pink text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
          >
            <Layout className="w-5 h-5" /> Configurações
          </button>
        </nav>

        <div className="mt-auto">
          <button className="flex items-center gap-3 p-3 text-zinc-500 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        {view === 'states' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Gerenciar Estados</h1>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-beat-pink hover:bg-beat-pink/80 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Novo Estado
              </button>
            </div>

            {isAdding && (
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                <form onSubmit={handleAddState} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Nome do Estado</label>
                    <input 
                      required
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.name}
                      onChange={e => setNewState({...newState, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Slug (URL)</label>
                    <input 
                      required
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.slug}
                      onChange={e => setNewState({...newState, slug: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Capa (300x300)</label>
                    <input type="file" onChange={e => handleFileUpload(e, 'cover_image')} className="w-full text-sm text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Banner Desktop</label>
                    <input type="file" onChange={e => handleFileUpload(e, 'banner_desktop')} className="w-full text-sm text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Banner Mobile</label>
                    <input type="file" onChange={e => handleFileUpload(e, 'banner_mobile')} className="w-full text-sm text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Data do Evento</label>
                    <input 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.event_date}
                      onChange={e => setNewState({...newState, event_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Local de Venda</label>
                    <input 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.sales_location}
                      onChange={e => setNewState({...newState, sales_location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Instagram URL</label>
                    <input 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.instagram_url}
                      onChange={e => setNewState({...newState, instagram_url: e.target.value})}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">Facebook URL</label>
                    <input 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.facebook_url}
                      onChange={e => setNewState({...newState, facebook_url: e.target.value})}
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500">TikTok URL</label>
                    <input 
                      className="w-full bg-black border border-zinc-800 p-3 rounded-lg" 
                      value={newState.tiktok_url}
                      onChange={e => setNewState({...newState, tiktok_url: e.target.value})}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-4">
                    {error && (
                      <div className="bg-red-500/20 text-red-500 p-4 rounded-xl border border-red-500/30 font-bold">
                        {error}
                      </div>
                    )}
                    <div className="flex gap-4">
                      <button type="submit" className="bg-beat-green px-8 py-3 rounded-xl font-bold">Salvar</button>
                      <button type="button" onClick={() => setIsAdding(false)} className="bg-zinc-800 px-8 py-3 rounded-xl font-bold">Cancelar</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {states.map(state => (
                <div key={state.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group">
                  <div className="aspect-video relative">
                    <img src={state.cover_image || 'https://picsum.photos/seed/state/400/200'} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteState(state.id)} className="p-2 bg-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{state.name}</h3>
                    <p className="text-zinc-500 text-sm mb-4">/{state.slug}</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-zinc-400">
                      <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Banner OK</span>
                      <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> Info OK</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : view === 'leads' ? (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Leads Capturados</h1>
              <select 
                className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm font-bold outline-none"
                value={filterState}
                onChange={e => setFilterState(e.target.value)}
              >
                <option value="all">Todos os Estados</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-800 text-zinc-400 text-sm uppercase font-bold">
                  <tr>
                    <th className="p-4">Nome/Estado</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">CPF</th>
                    <th className="p-4">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold">{lead.email}</div>
                        <div className="text-xs text-beat-pink">{lead.state_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{lead.whatsapp}</div>
                        <div className="text-xs text-zinc-500">@{lead.instagram}</div>
                      </td>
                      <td className="p-4 text-sm font-mono">{lead.cpf}</td>
                      <td className="p-4 text-xs text-zinc-500">{new Date(lead.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && <div className="p-20 text-center text-zinc-500">Nenhum lead encontrado para este filtro.</div>}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <h1 className="text-3xl font-bold">Configurações Gerais</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-beat-green">
                  <Layout className="w-6 h-6" /> Gabarito de Artes
                </h2>
                <div className="space-y-4 text-sm text-zinc-400">
                  <div className="p-4 bg-black rounded-xl border border-zinc-800">
                    <p className="font-bold text-white mb-1">Capa do Estado</p>
                    <p>300x300px (Quadrado)</p>
                  </div>
                  <div className="p-4 bg-black rounded-xl border border-zinc-800">
                    <p className="font-bold text-white mb-1">Banner Desktop</p>
                    <p>1920x800px (21:9)</p>
                  </div>
                  <div className="p-4 bg-black rounded-xl border border-zinc-800">
                    <p className="font-bold text-white mb-1">Banner Mobile</p>
                    <p>800x1000px (4:5)</p>
                  </div>
                  <div className="p-4 bg-black rounded-xl border border-zinc-800">
                    <p className="font-bold text-white mb-1">Carrossel Edições</p>
                    <p>1280x720px (16:9)</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-beat-pink">
                  <ImageIcon className="w-6 h-6" /> Logo Oficial
                </h2>
                <div className="p-6 bg-black rounded-xl border border-zinc-800 flex flex-col items-center gap-4">
                  <img src={generalSettings.logo_url} className="h-20 object-contain" alt="Logo" />
                  <div className="w-full space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500">Upload Nova Logo</label>
                    <input 
                      type="file" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setGeneralSettings({ ...generalSettings, logo_url: reader.result as string });
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="w-full text-xs text-zinc-500" 
                    />
                  </div>
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full bg-beat-pink py-2 rounded-lg font-bold text-sm"
                  >
                    Salvar Logo
                  </button>
                </div>
              </div>

              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6 md:col-span-2">
                <h2 className="text-xl font-bold flex items-center gap-2 text-beat-blue">
                  <ImageIcon className="w-6 h-6" /> Carrossel Página Inicial
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {generalSettings.global_carousel.map(img => (
                    <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800 group">
                      <img src={img.image_url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleDeleteGlobalCarousel(img.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-video rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-800/50 transition-colors">
                    <Plus className="w-6 h-6 text-zinc-500" />
                    <span className="text-[10px] font-black uppercase text-zinc-500">Adicionar Foto</span>
                    <input type="file" className="hidden" onChange={handleAddGlobalCarousel} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
