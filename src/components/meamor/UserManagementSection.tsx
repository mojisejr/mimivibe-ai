"use client";

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';

interface User {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
  stars: number;
  freePoints: number;
  coins: number;
  level: number;
  totalSpent: number;
  lastActivityDate?: string;
  paymentCount: number;
  readingCount: number;
}

interface UserData {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UserManagementSectionProps {
  className?: string;
}

export function UserManagementSection({ className = '' }: UserManagementSectionProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkOperationModal, setBulkOperationModal] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/user-management?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const result = await response.json();
      setUserData(result.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (typeof value === 'number' ? value : parseInt(value))
    }));
  };

  const handleUserSelection = (userId: string, selected: boolean) => {
    setSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected && userData) {
      setSelectedUsers(userData.users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkOperation = async (operation: string, value?: string) => {
    try {
      if (selectedUsers.length === 0) {
        alert('Please select users first');
        return;
      }

      const response = await fetch('/api/admin/user-management', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bulkOperation: {
            userIds: selectedUsers,
            operation,
            value
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to perform bulk operation');
      }

      const result = await response.json();
      alert(`Successfully updated ${result.data.updatedCount} users`);
      
      // Refresh data and clear selection
      await fetchUserData();
      setSelectedUsers([]);
      setBulkOperationModal(false);
      
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      alert('Failed to perform bulk operation');
    }
  };

  const handleSingleUserUpdate = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch('/api/admin/user-management', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          updates
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      alert('User updated successfully');
      await fetchUserData();
      
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityStatus = (lastActivityDate?: string) => {
    if (!lastActivityDate) return 'badge-neutral';
    
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActivity <= 1) return 'badge-success';
    if (daysSinceActivity <= 7) return 'badge-warning';
    return 'badge-error';
  };

  const getActivityStatusText = (lastActivityDate?: string) => {
    if (!lastActivityDate) return 'No Activity';
    
    const daysSinceActivity = Math.floor(
      (Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceActivity <= 1) return 'Active';
    if (daysSinceActivity <= 7) return 'Recent';
    return 'Inactive';
  };

  if (loading) {
    return (
      <Card variant="mystical" className={className}>
        <CardBody>
          <h3 className="heading-3 mb-4">User Management</h3>
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant="mystical" className={className}>
        <CardBody>
          <h3 className="heading-3 mb-4">User Management</h3>
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* User Management Controls */}
      <Card variant="mystical" className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="heading-3 mb-4 md:mb-0">User Management</h3>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered w-full md:w-64"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              
              <select
                className="select select-bordered w-full md:w-40"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="createdAt">Join Date</option>
                <option value="name">Name</option>
                <option value="level">Level</option>
                <option value="stars">Credits</option>
              </select>

              <select
                className="select select-bordered w-full md:w-32"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          {/* Bulk Operations */}
          {selectedUsers.length > 0 && (
            <div className="bg-base-200 p-4 rounded-lg mb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <span className="font-semibold">
                  {selectedUsers.length} user(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setBulkOperationModal(true)}
                  >
                    Bulk Operations
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setSelectedUsers([])}
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* User Data Table/Cards */}
      <Card variant="mystical">
        <CardBody>
          {userData && userData.users.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedUsers.length === userData.users.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th>User</th>
                      <th>Level</th>
                      <th>Credits</th>
                      <th>Activity</th>
                      <th>Total Spent</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.users.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                          />
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                {user.imageUrl ? (
                                  <img src={user.imageUrl} alt={user.name} />
                                ) : (
                                  <div className="bg-neutral-focus w-full h-full flex items-center justify-center">
                                    <span className="text-xs">{user.name?.charAt(0) || 'U'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold">{user.name || 'Unknown'}</div>
                              <div className="text-sm opacity-50">{user.email}</div>
                              <div className="text-xs opacity-50">
                                Joined: {formatDate(user.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-ghost">Lv.{user.level}</span>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>⭐ {user.stars}</div>
                            <div>🎁 {user.freePoints}</div>
                            <div>🪙 {user.coins}</div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">
                            <div>📖 {user.readingCount} readings</div>
                            <div>💳 {user.paymentCount} payments</div>
                          </div>
                        </td>
                        <td className="font-semibold text-success">
                          {formatCurrency(user.totalSpent)}
                        </td>
                        <td>
                          <div className={`badge ${getActivityStatus(user.lastActivityDate)}`}>
                            {getActivityStatusText(user.lastActivityDate)}
                          </div>
                        </td>
                        <td>
                          <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-xs">
                              ⚙️
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <a onClick={() => {
                                  const stars = prompt('Add stars:', '0');
                                  if (stars) handleSingleUserUpdate(user.id, { stars: user.stars + parseInt(stars) });
                                }}>
                                  Add Credits
                                </a>
                              </li>
                              <li>
                                <a onClick={() => {
                                  const coins = prompt('Add coins:', '0');
                                  if (coins) handleSingleUserUpdate(user.id, { coins: user.coins + parseInt(coins) });
                                }}>
                                  Add Coins
                                </a>
                              </li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {userData.users.map((user) => (
                  <div key={user.id} className="bg-base-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                        />
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            {user.imageUrl ? (
                              <img src={user.imageUrl} alt={user.name} />
                            ) : (
                              <div className="bg-neutral-focus w-full h-full flex items-center justify-center">
                                <span className="text-xs">{user.name?.charAt(0) || 'U'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-sm">{user.name || 'Unknown'}</div>
                          <div className="text-xs opacity-50">{user.email}</div>
                        </div>
                      </div>
                      <div className={`badge ${getActivityStatus(user.lastActivityDate)}`}>
                        {getActivityStatusText(user.lastActivityDate)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="opacity-70">Level:</span>
                        <div className="font-semibold">Lv.{user.level}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Total Spent:</span>
                        <div className="font-semibold text-success">{formatCurrency(user.totalSpent)}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Credits:</span>
                        <div>⭐{user.stars} 🎁{user.freePoints} 🪙{user.coins}</div>
                      </div>
                      <div>
                        <span className="opacity-70">Activity:</span>
                        <div>📖{user.readingCount} 💳{user.paymentCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {userData.pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <button
                    className="btn btn-sm"
                    disabled={!userData.pagination.hasPrev}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm">
                    Page {userData.pagination.page} of {userData.pagination.totalPages}
                  </span>
                  
                  <button
                    className="btn btn-sm"
                    disabled={!userData.pagination.hasNext}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-neutral-content">
              No users found
            </div>
          )}
        </CardBody>
      </Card>

      {/* Bulk Operations Modal */}
      {bulkOperationModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Bulk Operations</h3>
            <p className="py-4">
              Applying operation to {selectedUsers.length} selected user(s)
            </p>
            
            <div className="flex flex-col gap-4">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const credits = prompt('Credits to add:', '10');
                  if (credits) handleBulkOperation('updateCredits', credits);
                }}
              >
                Add Credits
              </button>
              
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const coins = prompt('Coins to add:', '100');
                  if (coins) handleBulkOperation('addCoins', coins);
                }}
              >
                Add Coins
              </button>
              
              <button
                className="btn btn-warning"
                onClick={() => {
                  if (confirm('Reset all credits for selected users?')) {
                    handleBulkOperation('resetCredits');
                  }
                }}
              >
                Reset All Credits
              </button>
            </div>
            
            <div className="modal-action">
              <button className="btn" onClick={() => setBulkOperationModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}