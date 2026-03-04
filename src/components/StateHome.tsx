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
        
        // Fetch Settings (Logo)
        const settingsSnap = await getDocs(collection(db, SETTINGS_COLLECTION));
        if (!settingsSnap.empty) {
          setLogoUrl(settingsSnap.docs[0].data().logo_url || LOGO_URL_DEFAULT);
        }

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

  if (loading) return <div className="min-h-screen bg-beat-pink flex items-center justify-center font-black text-white text-3xl italic uppercase beat-text-stroke">Carregando...</div>;
  if (!state) return <div className="min-h-screen bg-beat-pink flex items-center justify-center font-black text-white text-3xl italic uppercase beat-text-stroke">Estado não encontrado.</div>;

  return (
    <div className="min-h-screen bg-beat-pink text-white selection:bg-beat-green selection:text-black relative overflow-x-hidden">
      {/* Background Textures/Cracks */}
      <img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/401a755b-4375-4927-910c-99f57989393e"
        alt=""
        className="absolute top-0 left-0 w-full opacity-20 pointer-events-none z-0"
        referrerPolicy="no-referrer"
      />
      <img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/64062086-486a-4976-857e-07318f773634"
        alt=""
        className="absolute top-[1200px] left-0 w-full opacity-20 pointer-events-none z-0"
        referrerPolicy="no-referrer"
      />

      {/* Decorative Assets */}
      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/63683267-3392-498c-843c-662580533923"
        alt=""
        className="absolute top-40 left-[-50px] w-64 opacity-40 rotate-[-15deg] pointer-events-none z-0"
        animate={{ y: [0, -20, 0], rotate: [-15, -10, -15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />
      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/63683267-3392-498c-843c-662580533923"
        alt=""
        className="absolute top-[800px] right-[-100px] w-80 opacity-30 rotate-[20deg] pointer-events-none z-0"
        animate={{ y: [0, 30, 0], rotate: [20, 25, 20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />
      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/63be9163-549c-4632-9092-be2060100f2e"
        alt=""
        className="absolute top-[400px] right-10 w-48 opacity-40 pointer-events-none z-0"
        animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />
      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/63be9163-549c-4632-9092-be2060100f2e"
        alt=""
        className="absolute bottom-[200px] left-10 w-64 opacity-40 pointer-events-none z-0"
        animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />

      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/63683267-3392-498c-843c-662580533923"
        alt=""
        className="absolute top-[2200px] left-[-100px] w-96 opacity-40 rotate-[10deg] pointer-events-none z-0"
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />

      <img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/401a755b-4375-4927-910c-99f57989393e"
        alt=""
        className="absolute top-[100px] right-[-50px] w-64 opacity-20 pointer-events-none z-0"
        referrerPolicy="no-referrer"
      />

      <img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/64062086-486a-4976-857e-07318f773634"
        alt=""
        className="absolute top-[1200px] left-[-50px] w-64 opacity-20 pointer-events-none z-0"
        referrerPolicy="no-referrer"
      />

      <motion.img 
        src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/8f97204b-324f-4a00-983c-f91604533923"
        alt=""
        className="absolute bottom-[500px] left-[-50px] w-48 opacity-30 pointer-events-none z-0"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        referrerPolicy="no-referrer"
      />

      {/* Header Logo */}
      <header className="py-12 flex justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-beat-green rounded-[40%_60%_70%_30%/40%_50%_60%_40%] scale-150 blur-3xl opacity-30 -z-10" />
        <Link to="/">
          <img 
            src={logoUrl} 
            alt="Beat Fest" 
            className="h-24 md:h-32 drop-shadow-2xl"
          />
        </Link>
      </header>

      {/* Banner Section */}
      <section className="w-full">
        {/* Desktop Banner */}
        <div className="hidden md:block w-full aspect-[21/9] overflow-hidden">
          <img 
            src={state.banner_desktop || 'https://picsum.photos/seed/desktop/1920/800'} 
            alt="Banner Desktop" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Mobile Banner */}
        <div className="md:hidden w-full aspect-[4/5] overflow-hidden">
          <img 
            src={state.banner_mobile || 'https://picsum.photos/seed/mobile/800/1000'} 
            alt="Banner Mobile" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-5xl font-black uppercase italic beat-text-stroke text-beat-pink">
            {state.name}
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-xl font-bold">
            <div className="flex items-center gap-2 text-beat-blue">
              <Calendar className="w-6 h-6" />
              <span>{state.event_date || 'Em breve'}</span>
            </div>
            <div className="flex items-center gap-2 text-beat-green">
              <MapPin className="w-6 h-6" />
              <span>{state.sales_location || 'Local a definir'}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pre-registration Form or Closed Message */}
      <section className="bg-beat-blue py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/src/assets/textura.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          {state.pre_registration_enabled !== false ? (
            <>
              <div className="text-center mb-16">
                <h3 className="text-5xl md:text-7xl font-black uppercase italic mb-4 beat-text-stroke text-beat-yellow">Pré-Cadastro</h3>
                <p className="text-white text-xl font-bold max-w-2xl mx-auto">Cadastre-se para receber o link de vendas em primeira mão e garantir seu lugar no Beat Fest.</p>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">WhatsApp</label>
                  <input 
                    required
                    type="text" 
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: formatWhatsApp(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">E-mail</label>
                  <input 
                    required
                    type="email" 
                    placeholder="seu@email.com"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">Nascimento</label>
                  <input 
                    required
                    type="date" 
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">CPF</label>
                  <input 
                    required
                    type="text" 
                    placeholder="000.000.000-00"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.cpf}
                    onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">Instagram</label>
                  <input 
                    type="text" 
                    placeholder="@usuario"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">TikTok</label>
                  <input 
                    type="text" 
                    placeholder="@usuario"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.tiktok}
                    onChange={e => setFormData({...formData, tiktok: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">Profissão</label>
                  <input 
                    type="text" 
                    placeholder="Sua profissão"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.profession}
                    onChange={e => setFormData({...formData, profession: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-beat-yellow ml-2">Instituição</label>
                  <input 
                    type="text" 
                    placeholder="Nome da instituição"
                    className="w-full bg-white text-black border-4 border-black rounded-xl p-3 font-bold placeholder:text-zinc-400 focus:ring-4 ring-beat-pink outline-none transition-all"
                    value={formData.education}
                    onChange={e => setFormData({...formData, education: e.target.value})}
                  />
                </div>
                
                <button 
                  type="submit"
                  className="col-span-2 md:col-span-4 bg-beat-green hover:bg-beat-green/90 text-black font-black uppercase italic text-2xl py-6 rounded-2xl transition-all transform hover:scale-[1.02] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 mt-4"
                >
                  <Send className="w-8 h-8" />
                  Garantir Ingresso
                </button>

                {status.type && (
                  <div className={`col-span-2 md:col-span-4 p-6 rounded-2xl flex items-center gap-3 font-black uppercase italic border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${status.type === 'success' ? 'bg-beat-green text-black' : 'bg-red-500 text-white'}`}>
                    {status.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                    {status.message}
                  </div>
                )}
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-block bg-red-500 text-white font-black uppercase italic text-3xl md:text-5xl px-8 py-4 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6">
                Pré-Cadastro Encerrado
              </div>
              <p className="text-white text-xl font-bold max-w-2xl mx-auto">O período de pré-cadastro para esta cidade já foi finalizado. Fique atento às nossas redes sociais para informações sobre a abertura das vendas gerais.</p>
            </div>
          )}
        </div>
      </section>

      {/* Carousel Section (Edições Anteriores) */}
      {state.carousel && state.carousel.length > 0 && (
        <section className="py-24 bg-beat-green overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <img src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/src/assets/textura-2.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h3 className="text-5xl md:text-7xl font-black uppercase italic mb-16 text-center beat-text-stroke text-white">Edições Anteriores</h3>
            <div className="relative flex overflow-hidden">
              <motion.div 
                animate={{ x: [0, -100 * state.carousel.length + '%'] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 whitespace-nowrap"
              >
                {[...state.carousel, ...state.carousel].map((img: any, idx) => (
                  <motion.div 
                    key={`${img.id}-${idx}`} 
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="flex-none w-[300px] md:w-[500px] aspect-video rounded-3xl overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <img 
                      src={img.image_url} 
                      alt="Edição Anterior" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Global Carousel Section (Momentos Beat Fest) */}
      {globalCarousel.length > 0 && (
        <section className="py-24 bg-beat-yellow overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <img src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/src/assets/textura-2.png" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h3 className="text-5xl md:text-7xl font-black uppercase italic mb-16 text-center beat-text-stroke text-white">Momentos Beat Fest</h3>
            <div className="relative flex overflow-hidden">
              <motion.div 
                animate={{ x: [0, -100 * globalCarousel.length + '%'] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 whitespace-nowrap"
              >
                {[...globalCarousel, ...globalCarousel].map((img: any, idx) => (
                  <motion.div 
                    key={`${img.id}-${idx}`} 
                    whileHover={{ scale: 1.05, rotate: -2 }}
                    className="flex-none w-[300px] md:w-[500px] aspect-video rounded-3xl overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <img 
                      src={img.image_url} 
                      alt="Momento Beat Fest" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 bg-black text-center text-white">
        <img src={logoUrl} alt="Beat Fest" className="h-16 mx-auto mb-8 opacity-50 grayscale" />
        <p className="font-bold uppercase tracking-widest text-sm opacity-50">© 2026 Beat Fest. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-8 mt-8">
          {state.instagram_url && (
            <a href={state.instagram_url} target="_blank" rel="noopener noreferrer">
              <Instagram className="w-8 h-8 hover:text-beat-pink cursor-pointer transition-colors" />
            </a>
          )}
          {state.facebook_url && (
            <a href={state.facebook_url} target="_blank" rel="noopener noreferrer">
              <Send className="w-8 h-8 hover:text-beat-blue cursor-pointer transition-colors rotate-[-45deg]" />
            </a>
          )}
          {state.tiktok_url && (
            <a href={state.tiktok_url} target="_blank" rel="noopener noreferrer">
              <div className="w-8 h-8 flex items-center justify-center font-black text-xs border-2 border-white rounded-full hover:text-beat-green hover:border-beat-green transition-colors">TT</div>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
