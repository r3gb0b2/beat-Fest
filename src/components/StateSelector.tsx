import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Instagram } from 'lucide-react';
import { db } from '../lib/firebase-client';
import { collection, getDocs, query, where } from 'firebase/firestore';

const LOGO_URL_DEFAULT = "https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/8f97204b-324f-4a00-983c-f91604533923";
const HERO_BG_DEFAULT = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop";
const STATES_COLLECTION = "beatfest_states_v2";
const SETTINGS_COLLECTION = "beatfest_settings_v1";

export default function StateSelector() {
  const [states, setStates] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState(LOGO_URL_DEFAULT);
  const [groupLink, setGroupLink] = useState('');
  const [visualSettings, setVisualSettings] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch States
        const q = query(collection(db, STATES_COLLECTION), where('active', '==', 1));
        const snapshot = await getDocs(q);
        const statesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStates(statesList);

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
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-x-hidden font-sans">
      
      {/* HERO SECTION */}
      <section className="relative h-[60vh] md:h-[70vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={visualSettings.hero_bg || HERO_BG_DEFAULT} 
            alt="Festival Background" 
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
          <motion.img 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src={logoUrl} 
            alt="Beat Fest Logo" 
            className="h-40 md:h-60 mx-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            referrerPolicy="no-referrer"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-xl md:text-3xl font-medium mt-4 tracking-wide"
          >
            Mais Que Música. Cultura
          </motion.p>
        </div>
      </section>

      {/* SELECTION SECTION */}
      <section className="flex-1 bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black text-black text-center mb-12 tracking-tight uppercase">
            Escolha sua cidade
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {states.map((state, index) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate(`/${state.slug}`)}
                className="cursor-pointer group relative aspect-[4/5] overflow-hidden shadow-xl"
              >
                <img 
                  src={state.cover_image || 'https://picsum.photos/seed/state/400/500'} 
                  alt={state.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-white text-sm font-bold uppercase tracking-widest mb-1 opacity-80">Beatfest</span>
                  <h3 className="text-white text-4xl md:text-5xl font-black uppercase italic leading-none">
                    {state.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER / CTA SECTION */}
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
        
        {/* Decorative Icons in Footer */}
        {visualSettings.heart_url && (
          <img 
            src={visualSettings.heart_url} 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 w-20 opacity-40 pointer-events-none" 
            alt="" 
            referrerPolicy="no-referrer"
          />
        )}
        {visualSettings.crown_url && (
          <img 
            src={visualSettings.crown_url} 
            className="absolute top-10 right-1/4 w-12 opacity-40 pointer-events-none" 
            alt="" 
            referrerPolicy="no-referrer"
          />
        )}
        {visualSettings.ticket_url && (
          <img 
            src={visualSettings.ticket_url} 
            className="absolute top-10 right-10 w-20 opacity-40 pointer-events-none" 
            alt="" 
            referrerPolicy="no-referrer"
          />
        )}

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Side: Group CTA */}
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

          {/* Right Side: Logo and Social */}
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
