'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SlotsPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    testLink: '',
    description: ''
  });
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingSlot 
        ? `/api/slots/${editingSlot}` 
        : '/api/slots';
      
      const method = editingSlot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save slot');
      }

      setFormData({
        title: '',
        startTime: '',
        endTime: '',
        testLink: '',
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Time Slots</h1>
        <button 
          onClick={() => {
            if (showForm && editingSlot) {
              setFormData({
                title: '',
                startTime: '',
                endTime: '',
                testLink: '',
                description: ''
              });
              setEditingSlot(null);
            }
            setShowForm(!showForm);
          }} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Slot'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSlot ? 'Edit Slot' : 'Create New Slot'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="title">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="testLink">
                  Test Link *
                </label>
                <input
                  type="url"
                  id="testLink"
                  name="testLink"
                  value={formData.testLink}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="startTime">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="endTime">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="mb-4 md:col-span-2">
                <label className="block text-gray-700 mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                {editingSlot ? 'Update Slot' : 'Create Slot'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <p>Loading slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
          <p>No slots available. Create your first slot using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map((slot) => (
            <div key={slot.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-medium text-lg">{slot.title}</h3>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Time Slot:</p>
                  <p>
                    {formatDateTime(slot.startTime)} - {formatDateTime(slot.endTime)}
                  </p>
                </div>
                
                {slot.description && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500">Description:</p>
                    <p className="text-sm">{slot.description}</p>
                  </div>
                )}
                
                <div className="mb-3">
                  <p className="text-sm text-gray-500">Test Link:</p>
                  <a 
                    href={slot.testLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline break-words"
                  >
                    {slot.testLink}
                  </a>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(slot.id)}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}