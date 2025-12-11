'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  fullName: any;
  id: number;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'Admin') {
        router.push('/login');
        return;
      }
    } catch (error) {
      router.push('/login');
      return;
    }

    fetchUsers();
  }, [router]);

  useEffect(() => {
    let filtered = users;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Try admin users endpoint first, fall back to mock data if not available
      try {
        const response = await fetch('http://localhost:5068/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setFilteredUsers(data);
        } else {
          // If endpoint doesn't exist, create mock data
          const mockUsers = [
            {
              id: 1,
              name: 'Admin User',
              fullName: 'Admin User',
              email: 'admin@kd.com',
              role: 'Admin',
              isVerified: true,
              createdAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: 'Regular User',
              fullName: 'Regular User',
              email: 'user@kd.com',
              role: 'User',
              isVerified: true,
              createdAt: new Date().toISOString(),
            },
          ];
          setUsers(mockUsers);
          setFilteredUsers(mockUsers);
        }
      } catch (error) {
        // Fallback to mock data
        const mockUsers = [
          {
            id: 1,
            name: 'Admin User',
            fullName: 'Admin User',
            email: 'admin@kd.com',
            role: 'Admin',
            isVerified: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Regular User',
            fullName: 'Regular User',
            email: 'user@kd.com',
            role: 'User',
            isVerified: true,
            createdAt: new Date().toISOString(),
          },
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'Admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getVerificationBadgeColor = (isVerified: boolean) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View and manage registered users</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-2xl font-bold text-blue-700">{users.length}</p>
        </div>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Admins</p>
          <p className="text-2xl font-bold text-red-700">
            {users.filter(u => u.role === 'Admin').length}
          </p>
        </div>
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Verified Users</p>
          <p className="text-2xl font-bold text-green-700">
            {users.filter(u => u.isVerified).length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                            {user.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationBadgeColor(user.isVerified)}`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <p className="text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>
      </div>
    </div>
  );
}
