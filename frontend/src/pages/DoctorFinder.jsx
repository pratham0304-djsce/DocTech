import React, { useState, useEffect } from 'react'
import { Search, Filter, Star, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'
import request from '../utils/api'

export default function DoctorFinder({ initialDepartment = '' }) {
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    department: initialDepartment,
    location: '',
    experience: '',
    rating: '',
  })

  const [bookingModal, setBookingModal] = useState({ show: false, doctor: null })
  const [bookingData, setBookingData] = useState({ date: '', time: '', reason: '' })
  const [isBooking, setIsBooking] = useState(false)

  const DEPARTMENTS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 
    'Gynecology', 'Pediatrics', 'General Medicine', 'Psychiatry'
  ]

  useEffect(() => {
    fetchDoctors()
  }, [filters])

  const fetchDoctors = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Build query string, omitting empty values
      const query = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v) query.append(k, v)
      })

      const data = await request(`/doctors?${query.toString()}`)
      setDoctors(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // Check if a HOPI exists in session storage (from Chatbot)
  const getHopiFromStorage = () => {
    try {
      return sessionStorage.getItem('pendingHopi') || null
    } catch {
      return null
    }
  }

  const handleBook = async (e) => {
    e.preventDefault()
    setIsBooking(true)
    
    // Combine date/time
    const datetime = new Date(`${bookingData.date}T${bookingData.time}`).toISOString()
    const hopi = getHopiFromStorage()

    try {
      await request(`/doctors/${bookingModal.doctor._id}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          datetime, 
          reason: bookingData.reason,
          ...(hopi && { hopi }) // Attach HOPI if it exists
        }),
      })
      
      alert('Appointment booked successfully!')
      // Clear hopi if used so we don't attach it to future unrelated bookings
      sessionStorage.removeItem('pendingHopi')
      setBookingModal({ show: false, doctor: null })
      setBookingData({ date: '', time: '', reason: '' })
    } catch (err) {
      alert(err.message || 'Booking failed')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find a Doctor</h1>
          <p className="text-gray-500">Book appointments with top specialists</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
        
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <select
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              name="location"
              placeholder="City or Area"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="w-full sm:w-auto flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Experience</label>
            <select name="experience" value={filters.experience} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2">
              <option value="">Any</option>
              <option value="5">5+ Years</option>
              <option value="10">10+ Years</option>
              <option value="20">20+ Years</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
            <select name="rating" value={filters.rating} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2">
              <option value="">Any</option>
              <option value="4">4.0 & above</option>
              <option value="4.5">4.5 & above</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status & Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border p-6 h-64 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
          <p className="text-gray-500">No doctors found matching those filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {doctors.map(doc => (
            <div key={doc._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
              
              <div className="flex gap-4">
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl uppercase overflow-hidden">
                  {doc.profileImage ? (
                     <img src={doc.profileImage} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    doc.name?.split(' ').map(n=>n[0]).join('').substring(0,2) || 'Dr'
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-blue-600 text-sm font-medium mt-0.5">{doc.department}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {doc.rating || 'New'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {doc.experience || 0} yrs exp
                    </span>
                    {doc.location && (
                      <span className="flex items-center gap-1 w-full mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{doc.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setBookingModal({ show: true, doctor: doc })}
                  className="w-full py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-medium transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
              <p className="text-gray-500 text-sm mt-1">with {bookingModal.doctor?.name}</p>
            </div>
            
            <form onSubmit={handleBook} className="p-6 space-y-4 bg-gray-50/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="date" 
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={bookingData.date}
                      onChange={e => setBookingData({...bookingData, date: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input 
                      type="time" 
                      required
                      value={bookingData.time}
                      onChange={e => setBookingData({...bookingData, time: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                <textarea 
                  required
                  placeholder="Briefly describe your symptoms..."
                  value={bookingData.reason}
                  onChange={e => setBookingData({...bookingData, reason: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 bg-white"
                />
              </div>

              {getHopiFromStorage() && (
                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-100 flex items-start gap-2">
                  <div className="shrink-0 mt-0.5">🤖</div>
                  <p>Your AI triage analysis will be automatically attached to this appointment for the doctor to review.</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setBookingModal({ show: false, doctor: null })}
                  className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBooking}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isBooking ? 'Booking...' : 'Confirm Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
