import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User as UserIcon, Smartphone, Shield } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { User, Listing } from '../../types';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

type Tab = 'overview' | 'users' | 'listings' | 'reports' | 'waitlist';

// Type for users response (backend returns 'users' instead of 'listings')
type UsersResponse = {
  status: string;
  results: number;
  data: {
    users: User[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  };
};

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [usersPage, setUsersPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('');
  const [reportTypeFilter, setReportTypeFilter] = useState<string>('');
  const [waitlistPage, setWaitlistPage] = useState(1);

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

  // Fetch waitlist
  const { data: waitlistData, isLoading: waitlistLoading } = useQuery({
    queryKey: ['adminWaitlist', waitlistPage],
    queryFn: () => adminService.getWaitlist(waitlistPage, 50),
    enabled: activeTab === 'waitlist',
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

  // Delete waitlist entry mutation
  const deleteWaitlistMutation = useMutation({
    mutationFn: adminService.removeFromWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminWaitlist'] });
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

  const handleDeleteWaitlistEntry = (entryId: string, email: string) => {
    if (window.confirm(`Are you sure you want to remove "${email}" from the waitlist?`)) {
      deleteWaitlistMutation.mutate(entryId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Circuit Pattern Background */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="adminCircuit" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor:'#06b6d4',stopOpacity:1}} />
            <stop offset="50%" style={{stopColor:'#2563eb',stopOpacity:1}} />
            <stop offset="100%" style={{stopColor:'#7c3aed',stopOpacity:1}} />
          </linearGradient>
          <pattern id="adminPattern" x="0" y="0" width="400" height="300" patternUnits="userSpaceOnUse">
            <path d="M50 0 L50 90 L70 110 L70 200" stroke="url(#adminCircuit)" strokeWidth="2" fill="none"/>
            <path d="M100 0 L100 70 L120 90 L120 180" stroke="url(#adminCircuit)" strokeWidth="2" fill="none"/>
            <path d="M150 0 L150 100 L170 120 L170 220" stroke="url(#adminCircuit)" strokeWidth="2" fill="none"/>
            <circle cx="50" cy="90" r="4" fill="#06b6d4"/>
            <circle cx="100" cy="70" r="4" fill="#7c3aed"/>
            <rect x="116" y="86" width="8" height="8" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#adminPattern)"/>
      </svg>

      <h1 className="text-3xl font-bold text-white mb-8 relative z-10">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-300 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-300 hover:text-white'
            }`}
          >
            Listings
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'reports'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-300 hover:text-white'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('waitlist')}
            className={`pb-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === 'waitlist'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-300 hover:text-white'
            }`}
          >
            Waitlist
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
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-300">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.totalListings}</p>
                      <p className="text-sm text-gray-300">Total Listings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.activeListings}</p>
                      <p className="text-sm text-gray-300">Active Listings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stats.soldListings}</p>
                      <p className="text-sm text-gray-300">Sold Listings</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((user: User) => (
                        <div key={user._id} className="flex items-center gap-3 pb-3 border-b border-white/10 last:border-0">
                          <div className="h-10 w-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-300">{user.email}</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No recent users</p>
                    )}
                  </div>
                </div>

                {/* Recent Listings */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Listings</h3>
                  <div className="space-y-3">
                    {stats?.recentListings && stats.recentListings.length > 0 ? (
                      stats.recentListings.map((listing: Listing) => (
                      <div key={listing._id} className="flex items-center gap-3 pb-3 border-b border-white/10 last:border-0">
                        <div className="h-10 w-10 rounded-lg bg-gray-700 overflow-hidden shrink-0">
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
                          <p className="font-medium text-white truncate">{listing.title}</p>
                          <p className="text-sm text-cyan-400">PKR {listing.price.toLocaleString()}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No recent listings</p>
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
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">User</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Phone</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">City</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(usersResponse as unknown as UsersResponse).data.users && (usersResponse as unknown as UsersResponse).data.users.length > 0 ? (
                      (usersResponse as unknown as UsersResponse).data.users.map((user: User) => (
                      <tr key={user._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-semibold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{user.location?.city || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">
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
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
                  <p className="text-sm text-gray-300">
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
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Listing</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Seller</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Views</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Created</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {listingsResponse.data.listings && listingsResponse.data.listings.length > 0 ? (
                      listingsResponse.data.listings.map((listing: Listing) => (
                      <tr key={listing._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-700 overflow-hidden shrink-0">
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
                              <p className="font-medium text-white truncate">{listing.title}</p>
                              <p className="text-sm text-gray-300">{listing.phone.brand} {listing.phone.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{listing.seller.name}</td>
                        <td className="px-4 py-3 text-sm font-medium text-cyan-400">PKR {listing.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            listing.status === 'active' ? 'bg-green-500/20 text-green-300' :
                            listing.status === 'sold' ? 'bg-blue-500/20 text-blue-300' :
                            listing.status === 'draft' ? 'bg-gray-500/20 text-gray-300' :
                            'bg-red-500/20 text-red-300'
                          }`}>
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-300">{listing.views}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">
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
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
                  <p className="text-sm text-gray-300">
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
              {reportsData.map((report: { _id: string; reportType: string; status: string; createdAt: string; reporter: { name: string; email: string }; reportedUser?: { name: string; email: string }; reportedListing?: { title: string }; reason: string; description: string; adminNotes?: string; reviewedBy?: { name: string }; reviewedAt?: string }) => (
                <div key={report._id} className="bg-white/5 backdrop-blur-md border border-white/10 border-l-4 border-l-red-500 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Report Header */}
                      <div className="flex items-center gap-3 mb-3">
                        {report.reportType === 'user' ? (
                          <UserIcon className="w-6 h-6 text-cyan-400" />
                        ) : (
                          <Smartphone className="w-6 h-6 text-cyan-400" />
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-white">
                            {report.reportType === 'user' ? 'User Report' : 'Listing Report'}
                          </h3>
                          <p className="text-sm text-gray-300">
                            Reported {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          report.status === 'reviewed' ? 'bg-blue-500/20 text-blue-300' :
                          report.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>

                      {/* Report Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-300 font-medium">Reporter:</p>
                          <p className="text-sm text-white">{report.reporter?.name} ({report.reporter?.email})</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-300 font-medium">Reported:</p>
                          <p className="text-sm text-white">
                            {report.reportType === 'user' 
                              ? `${report.reportedUser?.name} (${report.reportedUser?.email})`
                              : report.reportedListing?.title}
                          </p>
                        </div>
                      </div>

                      {/* Reason & Description */}
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-4 border border-white/10">
                        <p className="text-sm font-bold text-gray-200 mb-2">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Reason: <span className="text-red-400">{report.reason.replace(/-/g, ' ').toUpperCase()}</span>
                        </p>
                        <p className="text-sm text-gray-300">{report.description}</p>
                      </div>

                      {/* Admin Notes */}
                      {report.adminNotes && (
                        <div className="bg-blue-500/20 backdrop-blur-md rounded-lg p-4 mb-4 border border-blue-400/30">
                          <p className="text-sm font-bold text-blue-300 mb-1">Admin Notes:</p>
                          <p className="text-sm text-gray-300">{report.adminNotes}</p>
                          {report.reviewedBy && report.reviewedAt && (
                            <p className="text-xs text-gray-400 mt-2">
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
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center py-12">
              <p className="text-gray-400">No reports found</p>
            </div>
          )}
        </>
      )}

      {/* Waitlist Tab */}
      {activeTab === 'waitlist' && (
        <>
          {waitlistLoading ? (
            <Loading />
          ) : waitlistData && waitlistData.waitlist.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white">Waitlist Entries</h2>
                  <p className="text-gray-300 mt-1">
                    Total: {waitlistData.pagination.totalItems} {waitlistData.pagination.totalItems === 1 ? 'entry' : 'entries'}
                  </p>
                </div>
              </div>

              {/* Waitlist Table */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-200 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {waitlistData.waitlist.map((entry) => (
                        <tr key={entry._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{entry.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{entry.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                              {entry.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {entry.notified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                                ✓ Notified
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                                ⏳ Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(entry.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteWaitlistEntry(entry._id, entry.email)}
                              disabled={deleteWaitlistMutation.isPending}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {waitlistData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setWaitlistPage((p) => Math.max(1, p - 1))}
                    disabled={waitlistPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="py-2 px-4 text-gray-300">
                    Page {waitlistData.pagination.currentPage} of {waitlistData.pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setWaitlistPage((p) => Math.min(waitlistData.pagination.totalPages, p + 1))}
                    disabled={waitlistPage === waitlistData.pagination.totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 text-center py-12">
              <p className="text-gray-400">No waitlist entries yet</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
