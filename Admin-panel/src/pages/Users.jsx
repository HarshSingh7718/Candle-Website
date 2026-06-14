import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, MoreVertical, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api";
import UserDetailModal from "../components/UserDetailModal";
import TableSkeleton from "../components/Skeletons/TableSkeleton";

const Users = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);

  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // reset page on filter
  };

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["adminUsers", page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit: 20
      });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      return res.data;
    }
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-base">Users</h1>
      </div>

      {/* Filters Bar */}
      <div className="bg-bg-surface p-4 rounded-xl shadow-sm border border-bg-muted flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-bg-muted border border-bg-muted rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors text-text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-4 py-2 bg-bg-muted border border-bg-muted rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-text-base"
        >
          <option value="all">All Users</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className={`bg-bg-surface rounded-xl shadow-sm border border-bg-muted overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-canvas border-b border-bg-muted text-sm font-medium text-text-muted">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-center">Orders</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-muted text-text-base">
              {isLoading ? (
                <TableSkeleton rows={20} cols={6} />
              ) : isError ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-danger">
                    Failed to load users.
                  </td>
                </tr>
              ) : data?.users?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                data?.users?.map((user) => (
                  <tr key={user._id} className="hover:bg-bg-surface-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-secondary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                          {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          {user.role === "admin" && (
                            <span className="text-xs bg-info/10 text-info px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                              <ShieldAlert size={10} /> Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      <div>{user.email}</div>
                      <div className="text-xs">{user.phoneNumber || "-"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      {user.ordersCount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? "bg-success/10 text-success" 
                          : "bg-danger/10 text-danger"
                      }`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedUser(user._id)}
                        className="px-3 py-1.5 text-sm font-medium text-brand-primary hover:text-coffee-800 bg-brand-primary/10 hover:bg-brand-primary/20 rounded transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="px-6 py-4 border-t border-bg-muted flex items-center justify-between">
            <span className="text-sm text-text-muted">
              Showing page {data.page} of {data.pages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-sm border border-bg-muted rounded hover:bg-bg-muted disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === data.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-sm border border-bg-muted rounded hover:bg-bg-muted disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={() => {
            queryClient.invalidateQueries(["adminUsers"]);
          }}
        />
      )}
    </div>
  );
};

export default Users;
