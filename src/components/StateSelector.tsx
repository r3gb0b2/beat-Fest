import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { db } from '../lib/firebase-client';
import { collection, getDocs, query, where } from 'firebase/firestore';

const LOGO_URL_DEFAULT = "https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/api/attachments/8f97204b-324f-4a00-983c-f91604533923";
const STATES_COLLECTION = "beatfest_states_v2";
const SETTINGS_COLLECTION = "beatfest_settings_v1";

export default function StateSelector() {
  const [states, setStates] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState(LOGO_URL_DEFAULT);
  const [visualSettings, setVisualSettings] = useState<any>({});
  const [carousel, setCarousel] = useState<any[]>([]);
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
        }

        // Fetch Individual Visual Assets
        const assetsSnap = await getDocs(collection(db, 'beatfest_visual_assets'));
        assetsSnap.forEach(doc => {
          visualData[doc.id] = doc.data().url;
        });
        setVisualSettings(visualData);

        // Fetch Global Carousel
        const carouselSnap = await getDocs(collection(db, 'global_carousel'));
        const carouselList = carouselSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCarousel(carouselList);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-beat-pink flex flex-col items-center justify-between relative overflow-x-hidden">
      {/* Decorative Elements from Assets */}
      {visualSettings.palm_url && (
        <>
          <img 
            src={visualSettings.palm_url} 
            alt="" 
            className="absolute top-10 left-10 w-32 md:w-48 opacity-80 rotate-[-15deg] pointer-events-none"
            referrerPolicy="no-referrer"
          />
          <img 
            src={visualSettings.palm_url} 
            alt="" 
            className="absolute top-20 right-[-20px] w-32 md:w-48 opacity-80 rotate-[20deg] pointer-events-none scale-x-[-1]"
            referrerPolicy="no-referrer"
          />
        </>
      )}

      {visualSettings.crack1_url && (
        <img 
          src={visualSettings.crack1_url}
          alt=""
          className="absolute bottom-40 left-[-50px] w-64 opacity-20 pointer-events-none z-0"
          referrerPolicy="no-referrer"
        />
      )}

      {visualSettings.crack2_url && (
        <img 
          src={visualSettings.crack2_url}
          alt=""
          className="absolute bottom-20 right-[-50px] w-64 opacity-20 pointer-events-none z-0"
          referrerPolicy="no-referrer"
        />
      )}

      {visualSettings.tiki_url && (
        <>
          <motion.img 
            src={visualSettings.tiki_url}
            alt=""
            className="absolute top-1/2 left-[-100px] w-64 opacity-30 pointer-events-none z-0"
            animate={{ x: [0, 20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            referrerPolicy="no-referrer"
          />

          <motion.img 
            src={visualSettings.tiki_url}
            alt=""
            className="absolute top-1/4 right-[-50px] w-48 opacity-30 pointer-events-none z-0"
            animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            referrerPolicy="no-referrer"
          />
        </>
      )}

      {/* Main Content Area (Green Shape Vibe) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full z-10 px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-12"
        >
          {/* Central Green Shape Background */}
          <div className="absolute inset-0 bg-beat-green rounded-[40%_60%_70%_30%/40%_50%_60%_40%] scale-150 blur-2xl opacity-50 -z-10" />
          
          <img 
            src={logoUrl} 
            alt="Beat Fest Logo" 
            className="h-40 md:h-56 mx-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white beat-text-stroke mb-12 text-center tracking-tighter">
          Escolha sua cidade
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl w-full">
          {states.map((state, index) => (
            <motion.div
              key={state.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 2 : -2 }}
              onClick={() => navigate(`/${state.slug}`)}
              className="cursor-pointer group relative aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-2xl"
            >
              <img 
                src={state.cover_image || 'https://picsum.photos/seed/state/300/300'} 
                alt={state.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-6">
                <h2 className="text-3xl font-black uppercase italic text-white beat-text-stroke">
                  {state.name}
                </h2>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Blue Section (Aguardem Vibe) */}
      <div className="w-full bg-beat-blue py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {visualSettings.texture_url && (
            <img src={visualSettings.texture_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          )}
        </div>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center relative z-10">
          <div className="flex gap-4">
            {visualSettings.tiki_url && (
              <img src={visualSettings.tiki_url} alt="" className="h-24 md:h-32 animate-bounce" referrerPolicy="no-referrer" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
