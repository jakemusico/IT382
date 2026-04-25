'use client'

import { useState, useTransition, useEffect } from 'react'
import { Plus, Search, Sparkles, Clock, Tag, Box, Trash2, Edit3, CheckCircle2, Loader2 } from 'lucide-react'
import { ServiceModal } from '@/components/admin/ServiceModal'
import { deleteService } from '@/app/actions/services'
import { createClient } from '@/utils/supabase/client'

export default function AdminServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const supabase = createClient()

  async function fetchServices() {
    setIsLoading(true)
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (data) setServices(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const categories = {
    kilo: 'Per Kilo Services',
    item: 'Per Item Services',
    addon: 'Add-ons & Extras'
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    setIsDeleting(id)
    const result = await deleteService(id)
    if (!result?.error) {
      setServices(services.filter(s => s.id !== id))
    }
    setIsDeleting(null)
  }

  const handleEdit = (service: any) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setSelectedService(null)
    setIsModalOpen(true)
  }

  const filteredServices = activeCategory 
    ? services.filter(s => s.category === activeCategory)
    : services

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Service Catalog
          </h1>
          <p className="text-gray-500 font-medium mt-1">Manage laundry offerings, pricing, and turnaround times.</p>
        </div>
        
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 active:scale-95 group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          Create New Service
        </button>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 border ${
            activeCategory === null 
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
              : 'bg-white border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
          }`}
        >
          All Services
        </button>
        {Object.entries(categories).map(([key, label]) => (
          <button 
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 active:scale-95 border ${
              activeCategory === key 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                : 'bg-white border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="w-12 h-12 text-blue-200 animate-spin mb-4" />
          <p className="text-gray-300 font-black text-xs uppercase tracking-widest">Accessing Directory...</p>
        </div>
      ) : (
        <>
          {/* Services Grid by Category */}
          {Object.entries(categories).map(([catKey, catLabel]) => {
            const catServices = filteredServices.filter(s => s.category === catKey)
            if (catServices.length === 0) return null

            return (
              <div key={catKey} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{catLabel}</h2>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catServices.map((service) => (
                    <div 
                      key={service.id}
                      className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 overflow-hidden"
                    >
                      {/* Background Accents */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                      
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500 shadow-inner">
                            <Box className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors duration-500" />
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              onClick={() => handleEdit(service)}
                              className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(service.id)}
                              disabled={isDeleting === service.id}
                              className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                              {isDeleting === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-gray-900 tracking-tight">{service.name}</h3>
                          <p className="text-gray-500 text-sm font-medium mt-2 line-clamp-2">{service.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                            <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                              <Tag className="w-3 h-3" />
                              Price
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-blue-600">₱{service.price}</span>
                              <span className="text-[10px] font-bold text-gray-400">/{service.unit}</span>
                            </div>
                          </div>

                          {service.turnaround && (
                            <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                              <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                <Clock className="w-3 h-3" />
                                Turnaround
                              </div>
                              <span className="text-[11px] font-black text-gray-900">{service.turnaround}</span>
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => handleEdit(service)}
                          className="w-full py-4 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Modify Settings
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Box className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900">No services found</h3>
              <p className="text-gray-500 mt-2">Start by creating your first laundry service.</p>
              <button 
                onClick={handleAdd}
                className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
              >
                Add Service
              </button>
            </div>
          )}
        </>
      )}

      <ServiceModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          fetchServices()
        }}
        service={selectedService}
      />
    </div>
  )
}
