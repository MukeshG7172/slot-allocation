'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateSlotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const departmentOptions = [
    'CSE',
    'AIDS',
    'IT',
    'CS',
    'CSBS',
    'AIML',
    'CIVIL',
    'MECH',
    'MCT',
    'ACT',
    'VLSI',
    'BME',
  ];

  const yearOptions = ['I', 'II', 'III'];

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
      setLoading(true);
      
      const response = await fetch('/api/slots/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create slot');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Create New Time Slot</h1>
          <Link href="/" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200">
            Back to Slots
          </Link>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-2xl transform transition-all hover:shadow-indigo-500/10 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="h-4 w-4 text-indigo-600 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-800"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-32 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white h-32 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium transition duration-200 disabled:bg-indigo-800 disabled:opacity-70"
              >
                {loading ? 'Creating...' : 'Create Slot'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} CIT Testing Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}