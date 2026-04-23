import Link from 'next/link'
import { Waves, CheckCircle, Clock, Star, ArrowRight, Phone, Mail, MapPin, Shirt, Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react'
import { TrackingForm } from '@/components/TrackingForm'
import { clsx } from 'clsx'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tight">LaundryPro</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            {['Services', 'About', 'Track', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-all"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link 
              href="/register" 
              className="group relative inline-flex items-center gap-2 bg-gray-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-10 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Laundry Care
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-8 italic">
                Purity in <br />
                <span className="text-blue-600">Every Fiber.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
                Experience the intersection of traditional care and modern technology. We don't just wash; we preserve your wardrobe with precision and passion.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-full hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                >
                  Create Account
                </Link>
                <a 
                  href="#track" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-gray-900 text-[11px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-full border border-gray-100 hover:border-blue-200 transition-all shadow-xl shadow-gray-100"
                >
                  Track Order
                </a>
              </div>

              {/* Quick Stats */}
              <div className="mt-16 flex items-center gap-12 border-t border-gray-100 pt-10">
                <div>
                  <p className="text-2xl font-black text-gray-900">4.9/5</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Average Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-gray-900">10k+</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Happy Clients</p>
                </div>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-200">
              <div className="absolute -inset-10 bg-blue-600/5 rounded-full blur-[100px]" />
              <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-[12px] border-white shadow-2xl shadow-blue-900/10 rotate-2">
                <img 
                  src="/premium_laundry_hero_1776980780315.png" 
                  alt="Premium Laundry Interior" 
                  className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
                />
                {/* Floating Elements */}
                <div className="absolute bottom-8 left-8 right-8 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white shadow-xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-wider">Insured Service</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">Your clothes are in safe hands</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-12">Trusted by residential & hospitality sectors</p>
          <div className="flex flex-wrap justify-center items-center gap-16 opacity-30 grayscale">
            {['Azure', 'Vanguard', 'Heritage', 'Lumina', 'Peak'].map((brand) => (
              <span key={brand} className="text-2xl font-black italic tracking-tighter text-gray-900">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4">Our Services</h2>
              <h3 className="text-5xl font-black text-gray-900 tracking-tight italic">Curated care for your <br /> lifestyle needs.</h3>
            </div>
            <p className="text-gray-400 font-medium max-w-sm mb-2">From everyday wear to delicate heirlooms, we apply bespoke cleaning protocols to every single item.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {[
              {
                icon: <Shirt className="w-7 h-7" />,
                title: 'Wash & Fold',
                description: 'The standard of clean. Industrial precision with home-style care.',
                price: '₱120/kg',
                color: 'blue'
              },
              {
                icon: <Zap className="w-7 h-7" />,
                title: 'Dry Clean',
                description: 'Chemical-free delicate processing for your most precious garments.',
                price: '₱250/pc',
                color: 'violet'
              },
              {
                icon: <Truck className="w-7 h-7" />,
                title: 'Concierge',
                description: 'Scheduled pickup and delivery that fits perfectly in your calendar.',
                price: '₱50/trip',
                color: 'emerald'
              }
            ].map((svc) => (
              <div key={svc.title} className="group relative p-12 bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  {svc.icon}
                </div>
                <div className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-lg",
                  svc.color === 'blue' ? "bg-blue-600 shadow-blue-100" :
                  svc.color === 'violet' ? "bg-violet-600 shadow-violet-100" : "bg-emerald-600 shadow-emerald-100"
                )}>
                  <div className="text-white">{svc.icon}</div>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-4">{svc.title}</h4>
                <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">{svc.description}</p>
                <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Starting at</span>
                  <span className="text-lg font-black italic text-gray-900">{svc.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracking Section */}
      <section id="track" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-900" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6">Order Intelligence</h2>
            <h3 className="text-5xl font-black text-white tracking-tight italic mb-8">Real-time Visibility.</h3>
            <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-xl mx-auto">
              No more guessing. Monitor every stage of your garment's journey from pickup to your doorstep.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <TrackingForm />
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/40 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                SMS Alerts
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Email Reports
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                GPS Tracking
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight italic">LaundryPro.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-10">
              {['Privacy', 'Terms', 'Support', 'Legal'].map((item) => (
                <a key={item} href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-colors">{item}</a>
              ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">© 2026 Crafted with precision.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
