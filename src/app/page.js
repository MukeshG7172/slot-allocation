'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function SlotsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    testLink: '',
    linkEnabled: false,
    departments: [],
    years: [],
    description: ''
  });
  const [editingSlot, setEditingSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const departmentOptions = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Physics',
    'Mathematics',
    'Biology'
  ];

  const yearOptions = ['I', 'II', 'III'];

  useEffect(() => {
    // Check admin status only if authenticated
    if (status === 'authenticated' && session?.user?.email) {
      checkAdminStatus(session.user.email);
    } else {
      setIsAdmin(false);
    }
    
    // Always fetch slots regardless of authentication status
    fetchSlots();
  }, [status, session]);

  const checkAdminStatus = async (email) => {
    try {
      const response = await fetch('/api/admin');
      if (!response.ok) {
        throw new Error('Failed to check admin status');
      }
      const data = await response.json();
      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/slots');
      if (!response.ok) {
        throw new Error('Failed to fetch slots');
      }
      const data = await response.json();
      setSlots(data);
      setError(null);
    } catch (err) {
      setError('Error loading slots. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleMultiSelect = (e, field) => {
    const options = [...e.target.selectedOptions].map(option => option.value);
    
    setFormData(prev => ({
      ...prev,
      [field]: options
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = `/api/slots/${editingSlot}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update slot');
      }

      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        testLink: '',
        linkEnabled: false,
        departments: [],
        years: [],
        description: ''
      });
      setShowForm(false);
      setEditingSlot(null);
      fetchSlots();
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slot?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/slots/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete slot');
      }
      
      fetchSlots();
    } catch (err) {
      setError('Error deleting slot. Please try again.');
      console.error(err);
    }
  };

  const handleEdit = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/slots/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch slot details');
      }
      
      const slotData = await response.json();
      
      const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
          .toISOString()
          .slice(0, 16);
      };
      
      setFormData({
        title: slotData.title,
        startTime: formatDateForInput(slotData.startTime),
        endTime: formatDateForInput(slotData.endTime),
        testLink: slotData.testLink,
        linkEnabled: slotData.linkEnabled || false,
        departments: slotData.departments || [],
        years: slotData.years || [],
        description: slotData.description || ''
      });
      
      setEditingSlot(id);
      setShowForm(true);
      setError(null);
    } catch (err) {
      setError('Error loading slot details. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  const handleAdminLogin = () => {
    router.push('/login');
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (loading && slots.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Available Time Slots</h1>
          <div className="flex items-center space-x-4">
            {!session ? (
              <button
                onClick={handleAdminLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Admin Panel
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Sign Out
              </button>
            )}
            <div className="h-20 w-60 relative bg-white rounded-lg">
              <Image 
                src="/citlogo.png" 
                alt="CIT Logo" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          {showForm ? (
            <button 
              onClick={() => {
                setFormData({
                  title: '',
                  startTime: '',
                  endTime: '',
                  testLink: '',
                  linkEnabled: false,
                  departments: [],
                  years: [],
                  description: ''
                });
                setEditingSlot(null);
                setShowForm(false);
              }} 
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Cancel
            </button>
          ) : (
            isAdmin && (
              <Link
                href="/create"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Add New Slot
              </Link>
            )
          )}
        </div>

        {showForm && isAdmin && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Edit Slot
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="title">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="testLink">
                    Test Link *
                  </label>
                  <input
                    type="url"
                    id="testLink"
                    name="testLink"
                    value={formData.testLink}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="linkEnabled">
                    Enable Link
                  </label>
                  <input
                    type="checkbox"
                    id="linkEnabled"
                    name="linkEnabled"
                    checked={formData.linkEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="startTime">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="endTime">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="departments">
                    Departments *
                  </label>
                  <select
                    id="departments"
                    name="departments"
                    multiple
                    value={formData.departments}
                    onChange={(e) => handleMultiSelect(e, 'departments')}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white h-32"
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-300 mb-2" htmlFor="years">
                    Years *
                  </label>
                  <select
                    id="years"
                    name="years"
                    multiple
                    value={formData.years}
                    onChange={(e) => handleMultiSelect(e, 'years')}
                    required
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white h-32"
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>

                <div className="mb-4 md:col-span-2">
                  <label className="block text-gray-300 mb-2" htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Update Slot
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-300">Loading slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-yellow-900 border border-yellow-800 text-yellow-300 p-4 rounded">
            <p>No slots available. {isAdmin && 'Create your first slot using the button above.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <div 
                key={slot.id} 
                className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-gray-700 p-4 border-b border-gray-600">
                  <h3 className="font-medium text-lg text-white">{slot.title}</h3>
                </div>
                
                <div className="p-4">
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Time Slot:</p>
                    <p className="text-gray-200">
                      {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Departments:</p>
                    <p className="text-gray-200">{slot.departments?.join(', ') || 'None specified'}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Years:</p>
                    <p className="text-gray-200">{slot.years?.join(', ') || 'None specified'}</p>
                  </div>
                  
                  {slot.description && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-400">Description:</p>
                      <p className="text-sm text-gray-200">{slot.description}</p>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-400">Test Link:</p>
                    <button 
                      onClick={() => {
                        if (slot.linkEnabled) {
                          window.open(slot.testLink, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      disabled={!slot.linkEnabled}
                      className={`px-3 py-1 rounded text-sm mt-1 ${
                        slot.linkEnabled 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      } transition duration-200`}
                    >
                      Take Test
                    </button>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(slot.id)}
                        className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm hover:bg-blue-800 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="bg-red-900 text-red-200 px-3 py-1 rounded text-sm hover:bg-red-800 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}