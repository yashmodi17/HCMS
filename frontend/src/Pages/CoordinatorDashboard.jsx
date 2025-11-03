import React, { useState, useEffect } from 'react';
import { Users, UserCheck, School, Settings, MapPin, Hash, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/UserContext';
import { api } from '../axios.config';

const CoordinatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [aanganwadiInfo, setAanganwadiInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [volunteerDoctors, setVolunteerDoctors] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [showAanganwadiForm, setShowAanganwadiForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    code: '',
    staffCapacity: 10
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCoordinatorData();
  }, []);

  const fetchCoordinatorData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/dashboard');
      const { aanganwadi, students, volunteers, staff } = response.data;
      
      setAanganwadiInfo(aanganwadi);
      setStudents(students || []);
      setVolunteerDoctors(volunteers || []);
      setStaffMembers(staff || []);
      
      // If no aanganwadi is assigned, show form
      if (!aanganwadi) {
        setShowAanganwadiForm(true);
      }
    } catch (error) {
      console.error('Error fetching coordinator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAanganwadiSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coordinator/aanganwadi', formData);
      setShowAanganwadiForm(false);
      fetchCoordinatorData();
    } catch (error) {
      console.error('Error creating aanganwadi:', error);
      alert(error.response?.data?.message || 'Failed to create aanganwadi');
    }
  };

  const handleViewProfile = (studentId) => {
    navigate(`/child/${studentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Coordinator Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
            </div>
            
            {/* Aanganwadi Info Header */}
            {aanganwadiInfo && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <School className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">{aanganwadiInfo.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-blue-700">
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {aanganwadiInfo.code}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {aanganwadiInfo.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!aanganwadiInfo && (
              <button
                onClick={() => setShowAanganwadiForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Setup Aanganwadi
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Aanganwadi Setup Form Modal */}
      {showAanganwadiForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Setup Your Aanganwadi</h2>
            <form onSubmit={handleAanganwadiSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aanganwadi Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter aanganwadi name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Enter full address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aanganwadi Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter unique code (e.g., AWD001)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.staffCapacity}
                  onChange={(e) => setFormData({...formData, staffCapacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create Aanganwadi
                </button>
                <button
                  type="button"
                  onClick={() => setShowAanganwadiForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {aanganwadiInfo ? (
          <>
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: Settings },
                    { id: 'students', label: 'Students', icon: Users },
                    { id: 'volunteers', label: 'Volunteer Doctors', icon: UserCheck },
                    { id: 'staff', label: 'Staff Members', icon: School }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Overview</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <div className="flex items-center">
                          <Users className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-blue-900">{students.length}</p>
                            <p className="text-blue-700">Total Students</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="flex items-center">
                          <UserCheck className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-green-900">{volunteerDoctors.length}</p>
                            <p className="text-green-700">Volunteer Doctors</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                        <div className="flex items-center">
                          <School className="h-8 w-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-purple-900">{staffMembers.length}</p>
                            <p className="text-purple-700">Staff Members</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Students ({students.length})</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Age
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Parent Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Health Records
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => {
                            const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
                            return (
                            <tr key={student._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {age} years
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.parentPhone || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {student.healthRecords?.length || 0} records
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleViewProfile(student._id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      
                      {students.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No students found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Volunteer Doctors Tab */}
                {activeTab === 'volunteers' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Volunteer Doctors ({volunteerDoctors.length})</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {volunteerDoctors.map((doctor) => (
                        <div key={doctor._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">Dr. {doctor.name}</h3>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'General Medicine'}</p>
                              <p className="text-sm text-gray-500 mt-1">{doctor.email}</p>
                              {doctor.phone && (
                                <p className="text-sm text-gray-500">{doctor.phone}</p>
                              )}
                            </div>
                            <div className="ml-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Volunteer
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {volunteerDoctors.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No volunteer doctors available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Tab */}
                {activeTab === 'staff' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Staff Members ({staffMembers.length})</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Staff ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {staffMembers.map((staff) => (
                            <tr key={staff._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.phone || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {staff.staffId || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(staff.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      {staffMembers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <School className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No staff members found</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <School className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Aanganwadi Assigned</h2>
            <p className="text-gray-600 mb-6">You need to set up your aanganwadi first to access the dashboard.</p>
            <button
              onClick={() => setShowAanganwadiForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Setup Aanganwadi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoordinatorDashboard;