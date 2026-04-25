import Link from 'next/link'
import { Waves, CheckCircle, Clock, Star, ArrowRight, Phone, Mail, MapPin, Shirt, Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { createClient } from '@/utils/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').order('created_at', { ascending: true })

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
            {['Services', 'About', 'Contact'].map((item) => (
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
                Simple & Fast Laundry
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.05] mb-8 italic">
                Fresh Laundry, <br />
                <span className="text-blue-600">Made Easy.</span>
              </h1>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-12 max-w-lg">
                Get your laundry washed, folded, and delivered straight to your door. We handle the chores so you don't have to.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] px-10 py-5 rounded-full hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 active:scale-95"
                >
                  Create Account
                </Link>
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
              <div className="absolute -inset-10 bg-blue-600/10 rounded-full blur-[100px]" />
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-blue-900/20 group">
                <img
                  src="/hero_laundry.png"
                  alt="Premium Laundry Interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                {/* Clean Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl pl-4 pr-6 py-4 rounded-2xl border border-white shadow-xl shadow-gray-200/50 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-0.5">Insured Service</p>
                    <p className="text-[10px] text-gray-500 font-medium">100% Quality Guarantee</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4">Our Services</h2>
              <h3 className="text-5xl font-black text-gray-900 tracking-tight italic">Everything you need <br /> for clean clothes.</h3>
            </div>
            <p className="text-gray-400 font-medium max-w-sm mb-2">From everyday wear to delicate items, we have the right service for you.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {(services || []).map((svc, index) => {
              const styles = [
                { icon: <Shirt className="w-7 h-7" />, color: 'blue' },
                { icon: <Zap className="w-7 h-7" />, color: 'violet' },
                { icon: <Truck className="w-7 h-7" />, color: 'emerald' },
                { icon: <Sparkles className="w-7 h-7" />, color: 'blue' },
              ]
              const style = styles[index % styles.length]

              return (
                <div key={svc.id} className="group relative p-12 bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    {style.icon}
                  </div>
                  <div className={clsx(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-transform group-hover:scale-110 duration-500 shadow-lg",
                    style.color === 'blue' ? "bg-blue-600 shadow-blue-100" :
                      style.color === 'violet' ? "bg-violet-600 shadow-violet-100" : "bg-emerald-600 shadow-emerald-100"
                  )}>
                    <div className="text-white">{style.icon}</div>
                  </div>
                  <h4 className="text-xl font-black text-gray-900 mb-4">{svc.name}</h4>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10">{svc.description}</p>
                  <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Starting at</span>
                    <span className="text-lg font-black italic text-gray-900">₱{svc.price}/{svc.unit}</span>
                  </div>
                </div>
              )
            })}
            
            {(!services || services.length === 0) && (
              <p className="text-gray-500 col-span-3 text-center py-10 font-medium">Services are currently being updated. Check back soon!</p>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-blue-50/50 flex items-center justify-center p-12">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
              <div className="relative z-10 space-y-8 text-center">
                <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-xl shadow-blue-900/5 flex items-center justify-center">
                  <Waves className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900 tracking-tight italic mb-2">Since 2026</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Setting the standard in fabric care</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4">About Us</h2>
              <h3 className="text-5xl font-black text-gray-900 tracking-tight italic mb-8">Redefining laundry <br /> for the modern world.</h3>
              <div className="space-y-6 text-lg text-gray-500 font-medium leading-relaxed mb-10">
                <p>
                  We believe that doing laundry shouldn't feel like a chore. That's why we created a seamless, technology-driven platform that takes the hassle out of fabric care.
                </p>
                <p>
                  Our state-of-the-art facilities use eco-friendly processes and rigorous quality checks to ensure your garments are not just clean, but preserved and treated with the utmost respect.
                </p>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Eco-Friendly</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Expert Care</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-[#fafbfc]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-600 mb-4">Get in Touch</h2>
          <h3 className="text-5xl font-black text-gray-900 tracking-tight italic mb-6">We're here to help.</h3>
          <p className="text-gray-400 font-medium max-w-lg mx-auto mb-20 text-lg">
            Have questions about our services or need assistance with an order? Our support team is ready to assist you.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Call Us</h4>
              <p className="text-gray-500 font-medium">+63 912 345 6789</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-4">Mon-Sat, 8am-8pm</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Email Us</h4>
              <p className="text-gray-500 font-medium">hello@laundrypro.com</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-4">24/7 Support</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Visit Us</h4>
              <p className="text-gray-500 font-medium">123 Clean Street</p>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-4">Metro Manila</p>
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
