import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Calendar, Instagram, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase-client';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  limit, 
  addDoc 
} from 'firebase/firestore';

const LOGO_URL_DEFAULT = "https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/8f97204b-324f-4a00-983c-f91604533923";
const STATES_COLLECTION = "beatfest_states_v2";
const LEADS_COLLECTION = "beatfest_leads_v2";
const SETTINGS_COLLECTION = "beatfest_settings_v1";

export default function StateHome() {
  const { slug } = useParams();
  const [state, setState] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState(LOGO_URL_DEFAULT);
  const [groupLink, setGroupLink] = useState('');
  const [visualSettings, setVisualSettings] = useState<any>({});
  const [globalCarousel, setGlobalCarousel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    whatsapp: '',
    email: '',
    dob: '',
    instagram: '',
    tiktok: '',
    profession: '',
    education: '',
    cpf: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3').substring(0, 14);
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').substring(0, 15);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers
      .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      .substring(0, 14);
  };

  useEffect(() => {
    const fetchState = async () => {
      try {
        const q = query(collection(db, STATES_COLLECTION), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setLoading(false);
          return;
        }

        const stateDoc = snapshot.docs[0];
        const stateData = stateDoc.data();
        
        const carouselQ = query(collection(db, 'carousel_images'), where('state_id', '==', stateDoc.id));
        const carouselSnapshot = await getDocs(carouselQ);
        const carousel = carouselSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fetch Settings (Logo and Visual Identity)
        const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));
        const visualData: any = {};
        if (!settingsSnap.empty) {
          const data = settingsSnap.docs[0].data();
          setLogoUrl(data.logo_url || LOGO_URL_DEFAULT);
          setGroupLink(data.group_link || '');
        }

        // Fetch Individual Visual Assets
        const assetsSnap = await getDocs(collection(db, 'beatfest_visual_assets'));
        assetsSnap.forEach(doc => {
          visualData[doc.id] = doc.data().url;
        });
        setVisualSettings(visualData);

        // Fetch Global Carousel
        const globalCarouselSnap = await getDocs(collection(db, 'global_carousel'));
        const globalCarouselList = globalCarouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGlobalCarousel(globalCarouselList);

        setState({ id: stateDoc.id, ...stateData, carousel });
        setLoading(false);
      } catch (err) {
        console.error('Error fetching state:', err);
        setLoading(false);
      }
    };
    fetchState();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    try {
      // Check for duplicates
      const emailQ = query(collection(db, LEADS_COLLECTION), where('email', '==', formData.email), limit(1));
      const emailCheck = await getDocs(emailQ);
      
      const cpfQ = query(collection(db, LEADS_COLLECTION), where('cpf', '==', formData.cpf), limit(1));
      const cpfCheck = await getDocs(cpfQ);
      
      if (!emailCheck.empty || !cpfCheck.empty) {
        throw new Error('E-mail ou CPF já cadastrado.');
      }

      await addDoc(collection(db, LEADS_COLLECTION), {
        ...formData,
        state_id: state.id,
        created_at: new Date().toISOString()
      });

      setStatus({ type: 'success', message: 'Cadastro realizado com sucesso! Fique atento às novidades.' });
      setFormData({
        whatsapp: '',
        email: '',
        dob: '',
        instagram: '',
        tiktok: '',
        profession: '',
        education: '',
        cpf: ''
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Erro ao realizar cadastro. Verifique as regras do Firestore.' });
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-black text-3xl italic uppercase">Carregando...</div>;
  if (!state) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-black text-3xl italic uppercase">Cidade não encontrada.</div>;

  return (
    <div className="min-h-screen bg-white text-black selection:bg-red-600 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[60vh] md:h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={state.banner_desktop || visualSettings.hero_bg || 'https://picsum.photos/seed/desktop/1920/800'} 
            alt={state.name} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        {/* Floating Icons */}
        {visualSettings.crown_url && (
          <motion.img 
            src={visualSettings.crown_url}
            className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 w-12 md:w-16 z-10"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            referrerPolicy="no-referrer"
          />
        )}
        {visualSettings.heart_url && (
          <motion.img 
            src={visualSettings.heart_url}
            className="absolute top-1/2 left-10 md:left-40 w-16 md:w-24 z-10 opacity-80"
            animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            referrerPolicy="no-referrer"
          />
        )}
        {visualSettings.ticket_url && (
          <motion.img 
            src={visualSettings.ticket_url}
            className="absolute top-1/3 right-10 md:right-40 w-16 md:w-24 z-10 opacity-80"
            animate={{ y: [0, 15, 0], rotate: [5, -5, 5] }}
            transition={{ duration: 5, repeat: Infinity }}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Logo and Tagline */}
        <div className="relative z-20 text-center px-4">
          <Link to="/">
            <motion.img 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={logoUrl} 
              alt="Beat Fest Logo" 
              className="h-40 md:h-60 mx-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              referrerPolicy="no-referrer"
            />
          </Link>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <span className="text-white text-sm font-bold uppercase tracking-widest mb-1 opacity-80 block">Beatfest</span>
            <h1 className="text-white text-4xl md:text-7xl font-black uppercase italic leading-none tracking-tight">
              {state.name}
            </h1>
          </motion.div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-white/90 text-lg md:text-xl font-bold mt-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              <span>{state.event_date || 'Em breve'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>{state.sales_location || 'Local a definir'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="bg-white py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          {state.pre_registration_enabled !== false ? (
            <>
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-black text-black text-center mb-4 tracking-tight uppercase">Pré-Cadastro</h2>
                <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                  Cadastre-se para receber o link de vendas em primeira mão e garantir seu lugar no Beat Fest {state.name}.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">WhatsApp</label>
                  <input 
                    required
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">E-mail</label>
                  <input 
                    required
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">Data de Nascimento</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold focus:border-red-600 outline-none transition-all"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">CPF</label>
                  <input 
                    required
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">Instagram</label>
                  <input 
                    type="text" 
                    placeholder="@usuario"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">TikTok</label>
                  <input 
                    type="text" 
                    placeholder="@usuario"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.tiktok}
                    onChange={e => setFormData({...formData, tiktok: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">Profissão</label>
                  <input 
                    type="text" 
                    placeholder="Sua profissão"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.profession}
                    onChange={e => setFormData({...formData, profession: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-400 ml-1">Colégio ou Faculdade</label>
                  <input 
                    type="text" 
                    placeholder="Nome da instituição"
                    className="w-full bg-zinc-50 text-black border border-zinc-200 rounded-xl p-4 font-bold placeholder:text-zinc-300 focus:border-red-600 outline-none transition-all"
                    value={formData.education}
                    onChange={e => setFormData({...formData, education: e.target.value})}
                  />
                </div>
                
                <button 
                  type="submit"
                  className="md:col-span-2 bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-2xl py-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 mt-4 shadow-lg shadow-red-600/20"
                >
                  <Send className="w-8 h-8" />
                  Garantir Ingresso
                </button>

                {status.type && (
                  <div className={`md:col-span-2 p-6 rounded-xl flex items-center gap-3 font-bold uppercase italic ${status.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                    {status.message}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-zinc-100 text-zinc-400 font-black uppercase italic text-3xl md:text-5xl px-8 py-4 rounded-2xl mb-6">
                Pré-Cadastro Encerrado
              </div>
              <p className="text-zinc-500 text-xl font-medium max-w-2xl mx-auto">O período de pré-cadastro para esta cidade já foi finalizado. Fique atento às nossas redes sociais para informações sobre a abertura das vendas gerais.</p>
            </div>
          )}
        </div>
      </section>

      {/* CAROUSELS */}
      <div className="space-y-0">
        {state.carousel && state.carousel.length > 0 && (
          <section className="py-20 bg-zinc-50 overflow-hidden relative border-y border-zinc-100">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-black text-center mb-12 tracking-tight uppercase">Edições Anteriores</h3>
              <div className="relative flex overflow-hidden">
                <motion.div 
                  animate={{ x: [0, -100 * state.carousel.length + '%'] }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 whitespace-nowrap"
                >
                  {[...state.carousel, ...state.carousel].map((img: any, idx) => (
                    <div 
                      key={`${img.id}-${idx}`} 
                      className="flex-none w-[300px] md:w-[450px] aspect-video rounded-2xl overflow-hidden shadow-lg"
                    >
                      <img 
                        src={img.image_url} 
                        alt="Edição Anterior" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {globalCarousel.length > 0 && (
          <section className="py-20 bg-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-black text-center mb-12 tracking-tight uppercase">Momentos Beat Fest</h3>
              <div className="relative flex overflow-hidden">
                <motion.div 
                  animate={{ x: [0, -100 * globalCarousel.length + '%'] }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="flex gap-6 whitespace-nowrap"
                >
                  {[...globalCarousel, ...globalCarousel].map((img: any, idx) => (
                    <div 
                      key={`${img.id}-${idx}`} 
                      className="flex-none w-[300px] md:w-[450px] aspect-video rounded-2xl overflow-hidden shadow-lg"
                    >
                      <img 
                        src={img.image_url} 
                        alt="Momento Beat Fest" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* FOOTER */}
      <section className="bg-black text-white py-20 px-6 relative overflow-hidden">
        {/* Footer Background Image */}
        {visualSettings.footer_bg && (
          <div className="absolute inset-0 z-0 opacity-40">
            <img 
              src={visualSettings.footer_bg} 
              alt="" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none text-red-600">
              Entre no <br /> nosso grupo
            </h2>
            <p className="text-zinc-400 text-lg max-w-md">
              Aqui, temos a união de fãs, fã clubes e admiradores de todo o Brasil. Faça parte desse time!
            </p>
            <a 
              href={groupLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-black uppercase italic text-2xl px-10 py-4 transition-all transform hover:scale-105"
            >
              Eu quero
            </a>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-6">
            <img 
              src={logoUrl} 
              alt="Beat Fest" 
              className="h-36 md:h-56"
              referrerPolicy="no-referrer"
            />
            <div className="flex items-center gap-3 text-2xl font-bold">
              <Instagram className="w-8 h-8" />
              <span>@beatfest</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
