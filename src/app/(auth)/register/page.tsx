'use client'

import { useActionState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'
import { Waves, Mail, Lock, User, MapPin, Phone, ArrowRight, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'

export default function RegisterPage() {
  const [error, formAction] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const result = await register(formData)
      return result?.error ?? null
    },
    null
  )
  const [isPending, startTransition] = useTransition()

  return (
    <div className="min-h-screen flex bg-[#fafbfc] selection:bg-blue-100">
      {/* Left panel - Visual Experience */}
      <div className="hidden lg:flex flex-[1.2] relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent" />

        {/* Glass Content Container */}
        <div className="relative w-full h-full p-16 flex flex-col justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight italic">LaundryPro.</span>
          </div>

          <div className="max-w-md animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <div className="w-12 h-1 bg-blue-500 mb-8 rounded-full" />
            <blockquote className="text-white text-4xl font-black leading-[1.1] mb-8 tracking-tight italic">
              &ldquo;The luxury of time starts with the quality of care.&rdquo;
            </blockquote>
            <p className="text-blue-200 text-xs font-black uppercase tracking-[0.4em] mb-12">Laundry Management System</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10">
                <p className="text-white text-2xl font-black italic">100%</p>
                <p className="text-[9px] text-blue-200 font-black uppercase tracking-widest mt-1">Fiber Integrity</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[2rem] border border-white/10">
                <p className="text-white text-2xl font-black italic">24/7</p>
                <p className="text-[9px] text-blue-200 font-black uppercase tracking-widest mt-1">Live Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form Experience */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
          <div className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors group mb-6"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Website
            </Link>

            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Waves className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight">LaundryPro.</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter italic">Join Us.</h1>
            <p className="text-gray-400 font-medium text-xs">Create your new account below.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in shake-in duration-300">
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 font-black text-xs">!</span>
              </div>
              <p className="text-red-600 text-xs font-black uppercase tracking-tight">{error}</p>
            </div>
          )}

          <form
            action={(formData) => startTransition(() => formAction(formData))}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="full_name" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Legal Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    placeholder="Juan dela Cruz"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="contact_number" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Contact Number
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    id="contact_number"
                    name="contact_number"
                    type="tel"
                    required
                    placeholder="09123456789"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                Residential Address
              </label>
              <div className="relative group">
                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  placeholder="Street, City, Province"
                  className="w-full pl-14 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>



            <div className="space-y-1">
              <label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                Security Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full pl-14 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full relative group overflow-hidden bg-gray-900 text-white font-black text-[11px] uppercase tracking-[0.3em] py-4 rounded-2xl shadow-2xl shadow-gray-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10 flex items-center gap-2">
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                  ) : (
                    <>Create Account <ArrowRight className="w-4 h-4" /></>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-50 text-center">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign In</Link>
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-300">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Secure Form</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
