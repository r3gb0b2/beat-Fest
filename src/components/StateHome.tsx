import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MapPin, Calendar, Instagram, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StateHome() {
  const { slug } = useParams();
  const [state, setState] = useState<any>(null);
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

  useEffect(() => {
    fetch(`/api/states/${slug}`)
      .then(res => res.json())
      .then(data => {
        setState(data);
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, state_id: state.id })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

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
      setStatus({ type: 'error', message: err.message });
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center">Carregando...</div>;
  if (!state) return <div className="min-h-screen bg-black flex items-center justify-center">Estado não encontrado.</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Logo */}
      <header className="py-8 flex justify-center">
        <Link to="/">
          <img 
            src="https://ais-dev-4xcyr6of7gldh4parsg7su-45902503545.us-west1.run.app/src/assets/logo.png" 
            alt="Beat Fest" 
            className="h-24 md:h-32"
            onError={(e) => (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/beatfest/400/200'}
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

      {/* Pre-registration Form */}
      <section className="bg-zinc-900 py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-black uppercase italic mb-4">Pré-Cadastro</h3>
            <p className="text-zinc-400 text-lg">Cadastre-se para receber o link de vendas em primeira mão e garantir seu lugar no Beat Fest.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">WhatsApp</label>
              <input 
                required
                type="text" 
                placeholder="(00) 00000-0000"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">E-mail</label>
              <input 
                required
                type="email" 
                placeholder="seu@email.com"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">Data de Nascimento</label>
              <input 
                required
                type="date" 
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.dob}
                onChange={e => setFormData({...formData, dob: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">CPF</label>
              <input 
                required
                type="text" 
                placeholder="000.000.000-00"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.cpf}
                onChange={e => setFormData({...formData, cpf: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">Instagram</label>
              <input 
                type="text" 
                placeholder="@usuario"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.instagram}
                onChange={e => setFormData({...formData, instagram: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">TikTok</label>
              <input 
                type="text" 
                placeholder="@usuario"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.tiktok}
                onChange={e => setFormData({...formData, tiktok: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">Profissão</label>
              <input 
                type="text" 
                placeholder="Sua profissão"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.profession}
                onChange={e => setFormData({...formData, profession: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase text-zinc-500">Colégio ou Faculdade</label>
              <input 
                type="text" 
                placeholder="Nome da instituição"
                className="w-full bg-black border-2 border-zinc-800 rounded-xl p-4 focus:border-beat-pink outline-none transition-colors"
                value={formData.education}
                onChange={e => setFormData({...formData, education: e.target.value})}
              />
            </div>
            
            <button 
              type="submit"
              className="md:col-span-2 bg-beat-pink hover:bg-beat-pink/80 text-white font-black uppercase italic text-2xl py-6 rounded-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 mt-4"
            >
              <Send className="w-8 h-8" />
              Quero Garantir Meu Ingresso
            </button>

            {status.type && (
              <div className={`md:col-span-2 p-4 rounded-xl flex items-center gap-3 font-bold ${status.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
                {status.message}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Carousel Section */}
      {state.carousel && state.carousel.length > 0 && (
        <section className="py-20 bg-black overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-4xl font-black uppercase italic mb-12 text-center">Edições Anteriores</h3>
            <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
              {state.carousel.map((img: any) => (
                <div key={img.id} className="flex-none w-80 md:w-96 aspect-video rounded-2xl overflow-hidden snap-center border-2 border-zinc-800">
                  <img 
                    src={img.image_url} 
                    alt="Edição Anterior" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-center text-zinc-500">
        <p>© 2026 Beat Fest. Todos os direitos reservados.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Instagram className="w-6 h-6 hover:text-beat-pink cursor-pointer transition-colors" />
        </div>
      </footer>
    </div>
  );
}
