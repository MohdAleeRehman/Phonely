import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import type { User, Listing } from '../../types';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

type Tab = 'overview' | 'users' | 'listings' | 'reports';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [usersPage, setUsersPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getDashboard,
  });

  // Fetch users
  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', usersPage],
    queryFn: () => adminService.getUsers(usersPage, 10),
    enabled: activeTab === 'users',
  });

  // Fetch listings
  const { data: listingsResponse, isLoading: listingsLoading } = useQuery({
    queryKey: ['adminListings', listingsPage, listingStatusFilter],
    queryFn: () =>
      adminService.getListings(listingStatusFilter || 'all', listingsPage, 10),
    enabled: activeTab === 'listings',
  });

  // Fetch reports
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['adminReports', reportStatusFilter, reportTypeFilter],
    queryFn: () => adminService.getReports(reportStatusFilter, reportTypeFilter),
    enabled: activeTab === 'reports',
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: adminService.deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminListings'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // Update report mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, data }: { reportId: string; data: { status: string; adminNotes?: string } }) =>
      adminService.updateReportStatus(reportId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
    },
  });

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleDeleteListing = (listingId: string, listingTitle: string) => {
    if (window.confirm(`Are you sure you want to delete listing "${listingTitle}"?`)) {
      deleteListingMutation.mutate(listingId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {statsLoading ? (
            <Loading />
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalListings}</p>
                      <p className="text-sm text-gray-600">Total Listings</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.activeListings}</p>
                      <p className="text-sm text-gray-600">Active Listings</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.soldListings}</p>
                      <p className="text-sm text-gray-600">Sold Listings</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((user: User) => (
                        <div key={user._id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent users</p>
                    )}
                  </div>
                </div>

                {/* Recent Listings */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recent Listings</h3>
                  <div className="space-y-3">
                    {stats?.recentListings && stats.recentListings.length > 0 ? (
                      stats.recentListings.map((listing: Listing) => (
                      <div key={listing._id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                        <div className="h-10 w-10 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                          {listing.images?.[0] ? (
                            (() => {
                              const first = listing.images[0];
                              const src = typeof first === 'string' ? first : first?.url;
                              return src ? <img src={src} alt={listing.title} className="h-full w-full object-cover" /> : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{listing.title}</p>
                          <p className="text-sm text-primary-600">PKR {listing.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent listings</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <ErrorMessage message="Failed to load dashboard statistics" />
          )}
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <>
          {usersLoading ? (
            <Loading />
          ) : usersResponse ? (
            <>
              <div className="card overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">City</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usersResponse.data.listings && usersResponse.data.listings.length > 0 ? (
                      usersResponse.data.listings.map((user: User) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">{user.phone}</td>
                        <td className="px-4 py-3 text-sm">{user.location?.city || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            disabled={user.role === 'admin' || deleteUserMutation.isPending}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersResponse.data.pagination && usersResponse.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Page {usersResponse.data.pagination.currentPage} of {usersResponse.data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setUsersPage((p) => p + 1)}
                      disabled={usersPage >= usersResponse.data.pagination.totalPages}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ErrorMessage message="Failed to load users" />
          )}
        </>
      )}

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <>
          {/* Filter */}
          <div className="mb-6">
            <select
              value={listingStatusFilter}
              onChange={(e) => {
                setListingStatusFilter(e.target.value);
                setListingsPage(1);
              }}
              className="input-field max-w-xs"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
              <option value="removed">Removed</option>
            </select>
          </div>

          {listingsLoading ? (
            <Loading />
          ) : listingsResponse ? (
            <>
              <div className="card overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Listing</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Seller</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Views</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {listingsResponse.data.listings && listingsResponse.data.listings.length > 0 ? (
                      listingsResponse.data.listings.map((listing: Listing) => (
                      <tr key={listing._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden shrink-0">
                              {listing.images?.[0] ? (
                                (() => {
                                  const first = listing.images[0];
                                  const src = typeof first === 'string' ? first : first?.url;
                                  return src ? <img src={src} alt={listing.title} className="h-full w-full object-cover" /> : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  );
                                })()
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">{listing.title}</p>
                              <p className="text-sm text-gray-600">{listing.phone.brand} {listing.phone.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{listing.seller.name}</td>
                        <td className="px-4 py-3 text-sm font-medium">PKR {listing.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            listing.status === 'active' ? 'bg-green-100 text-green-800' :
                            listing.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                            listing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{listing.views}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDeleteListing(listing._id, listing.title)}
                            disabled={deleteListingMutation.isPending}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No listings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {listingsResponse.data.pagination && listingsResponse.data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Page {listingsResponse.data.pagination.currentPage} of {listingsResponse.data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setListingsPage((p) => Math.max(1, p - 1))}
                      disabled={listingsPage === 1}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setListingsPage((p) => p + 1)}
                      disabled={listingsPage >= listingsResponse.data.pagination.totalPages}
                      className="btn-secondary disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <ErrorMessage message="Failed to load listings" />
          )}
        </>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <select
              value={reportStatusFilter}
              onChange={(e) => setReportStatusFilter(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="">All Types</option>
              <option value="user">User Reports</option>
              <option value="listing">Listing Reports</option>
            </select>
          </div>

          {reportsLoading ? (
            <Loading />
          ) : reportsData && reportsData.length > 0 ? (
            <div className="space-y-4">
              {reportsData.map((report: any) => (
                <div key={report._id} className="card border-l-4 border-l-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Report Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">
                          {report.reportType === 'user' ? '👤' : '📱'}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg">
                            {report.reportType === 'user' ? 'User Report' : 'Listing Report'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Reported {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Report Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Reporter:</p>
                          <p className="text-sm">{report.reporter?.name} ({report.reporter?.email})</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Reported:</p>
                          <p className="text-sm">
                            {report.reportType === 'user' 
                              ? `${report.reportedUser?.name} (${report.reportedUser?.email})`
                              : report.reportedListing?.title}
                          </p>
                        </div>
                      </div>

                      {/* Reason & Description */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">
                          🚨 Reason: <span className="text-red-600">{report.reason.replace(/-/g, ' ').toUpperCase()}</span>
                        </p>
                        <p className="text-sm text-gray-700">{report.description}</p>
                      </div>

                      {/* Admin Notes */}
                      {report.adminNotes && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <p className="text-sm font-bold text-blue-700 mb-1">Admin Notes:</p>
                          <p className="text-sm text-gray-700">{report.adminNotes}</p>
                          {report.reviewedBy && (
                            <p className="text-xs text-gray-500 mt-2">
                              Reviewed by {report.reviewedBy.name} on {new Date(report.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <button
                        onClick={() => {
                          const adminNotes = prompt('Add admin notes (optional):');
                          updateReportMutation.mutate({
                            reportId: report._id,
                            data: { status: 'reviewed', adminNotes: adminNotes || undefined }
                          });
                        }}
                        disabled={updateReportMutation.isPending}
                        className="btn-secondary text-sm"
                      >
                        Mark as Reviewed
                      </button>
                      <button
                        onClick={() => {
                          const adminNotes = prompt('Add resolution notes:');
                          if (adminNotes) {
                            updateReportMutation.mutate({
                              reportId: report._id,
                              data: { status: 'resolved', adminNotes }
                            });
                          }
                        }}
                        disabled={updateReportMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          const adminNotes = prompt('Why is this report being dismissed?');
                          if (adminNotes) {
                            updateReportMutation.mutate({
                              reportId: report._id,
                              data: { status: 'dismissed', adminNotes }
                            });
                          }
                        }}
                        disabled={updateReportMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No reports found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
