import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, FileText, Bot } from 'lucide-react'
import request from '../utils/api'

export default function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Get user role from local storage to conditionally render Doctor vs Patient info
  const user = JSON.parse(localStorage.getItem('user')) || {}
  const isDoctor = user.role === 'doctor'

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await request('/doctors/appointments/all')
      setAppointments(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      await request(`/doctors/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      fetchAppointments()
    } catch (err) {
      alert(err.message || 'Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-amber-100 text-amber-700 border-amber-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Appointments</h1>
        <p className="text-gray-500">
          {isDoctor ? 'Manage your upcoming patient consultations' : 'Track your upcoming doctor visits'}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-900 font-medium">No appointments found</h3>
          <p className="text-gray-500 text-sm mt-1">You don't have any scheduled appointments yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map(apt => (
            <div key={apt._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              
              {/* Left Column: Date & Time */}
              <div className="md:w-48 shrink-0 flex flex-col justify-center items-center p-4 bg-primary-50 rounded-xl border border-primary-100/50">
                <div className="text-sm font-semibold text-primary-600 uppercase tracking-widest">
                  {new Date(apt.datetime).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-4xl font-black text-primary-900 my-1">
                  {new Date(apt.datetime).getDate()}
                </div>
                <div className="text-sm font-medium text-primary-700 flex items-center gap-1.5 mt-2">
                  <Clock className="w-4 h-4" />
                  {new Date(apt.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Middle Column: Details */}
              <div className="flex-1 min-w-0 py-2">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {isDoctor ? apt.patient?.name || 'Unknown Patient' : apt.doctor?.name || 'Unknown Doctor'}
                    </h3>
                    <p className="text-primary-600 font-medium text-sm">
                      {isDoctor ? 'Patient Visit' : apt.doctor?.department}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(apt.status)}`}>
                    {apt.status.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex gap-2">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-700">Reason:</span> {apt.reason || 'No reason provided'}
                    </p>
                  </div>
                  
                  {/* AI HOPI Box - Important for Doctors */}
                  {apt.hopi && (
                    <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                      <div className="flex gap-2.5">
                        <Bot className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">AI Triage Summary (HOPI)</p>
                          <p className="text-sm text-blue-900/80 whitespace-pre-wrap leading-relaxed">{apt.hopi}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!isDoctor && apt.doctor?.hospital && (
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">
                        {apt.doctor.hospital}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Actions (For Doctors) */}
              {isDoctor && apt.status === 'pending' && (
                <div className="md:w-40 shrink-0 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => handleUpdateStatus(apt._id, 'confirmed')}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                    className="w-full py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {isDoctor && apt.status === 'confirmed' && (
                <div className="md:w-40 shrink-0 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <button 
                    onClick={() => handleUpdateStatus(apt._id, 'completed')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Mark Completed
                  </button>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
