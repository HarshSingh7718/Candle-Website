import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGetContacts, useUpdateContactStatus } from '../hooks/useContacts';
import TableSkeleton from '../components/Skeletons/TableSkeleton';

import { Search, X } from 'lucide-react';

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 👉 New state for the modal popup
  const [selectedContact, setSelectedContact] = useState(null);

  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  // 👉 Fetch from Backend
  const { data, isLoading, isFetching } = useGetContacts(page, limit);
  const { mutate: updateStatus } = useUpdateContactStatus();

  const queries = data?.contacts || [];
  const totalContacts = data?.totalContacts || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    if (rowsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [queries, searchQuery, isLoading]);

  const toggleStatus = (id, currentStatus) => {
    // Backend accepts exactly "pending" or "resolved"
    const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
    updateStatus({ id, status: newStatus });
  };

  // Local Search Filter
  const filteredQueries = queries.filter(query => {
    const searchLower = searchQuery.toLowerCase();
    return (
      query.name?.toLowerCase().includes(searchLower) ||
      query.email?.toLowerCase().includes(searchLower) ||
      query.phone?.includes(searchLower) ||
      query.message?.toLowerCase().includes(searchLower)
    );
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };



  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full pb-20 flex-1 opacity-0">

      {/* Page Header */}
      <div className="mb-stack-lg">
        <h2 className="font-heading text-headline-xl text-text-base mb-2">Customer Support</h2>
        <p className="font-body-lg text-body-lg text-text-muted">Manage and respond to customer inquiries and feedback.</p>
      </div>

      {/* Queries List Card */}
      <div className={`bg-bg-surface rounded-xl border border-bg-mutedest shadow-sm overflow-hidden p-stack-md relative transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-md pb-stack-sm border-b border-bg-muted gap-4">
          <h3 className="font-heading text-headline-md text-text-base">Recent Queries</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className=" absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-bg-surface-hover rounded-lg border-none focus:ring-2 focus:ring-brand-primary/20 text-body-md font-body-md placeholder:text-text-disabled transition-all outline-none"
                placeholder="Search queries..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-bg-muted">
                <th className="py-4 px-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Customer</th>
                {/* 👉 Replaced Subject with Message */}
                <th className="py-4 px-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Message</th>
                <th className="py-4 px-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Date Received</th>
                <th className="py-4 px-4 font-label-md text-label-md text-text-muted uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 font-label-md text-label-md text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={limit} cols={5} />
              ) : filteredQueries.map((query) => (
                <tr
                  key={query._id}
                  ref={addToRowsRef}
                  // 👉 Triggers popup on row click
                  onClick={() => setSelectedContact(query)}
                  className="border-b border-bg-muted hover:bg-bg-surface-hover transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-text-base">{query.name}</span>
                      {/* 👉 Replaced Email with Phone */}
                      <span className="font-label-sm text-label-sm text-text-muted">{query.phone || "No phone provided"}</span>
                    </div>
                  </td>
                  {/* 👉 Show truncated message */}
                  <td className="py-4 px-4 font-body-md text-body-md text-text-base max-w-[250px] truncate">
                    {query.message}
                  </td>
                  <td className="py-4 px-4 font-body-md text-body-md text-text-muted">
                    {new Date(query.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-4">
                    {query.status === 'resolved' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-success/10 text-success border border-success/20 capitalize">
                        {query.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-bg-canvas text-text-muted border border-bg-muted capitalize">
                        {query.status}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 👉 Prevents the popup from opening when clicking this button
                        toggleStatus(query._id, query.status);
                      }}
                      className="text-brand-primary hover:text-text-on-brand-fixed-variant transition-colors font-label-md text-label-md cursor-pointer"
                    >
                      {query.status === 'resolved' ? 'Reopen' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))}

              {(!isLoading && filteredQueries.length === 0) && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-text-muted">
                    No queries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-stack-md flex flex-col sm:flex-row justify-between items-center pt-stack-sm border-t border-bg-muted gap-4">
          <span className="font-label-md text-label-md text-text-muted">
            Showing {totalContacts === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalContacts)} of {totalContacts} queries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-bg-muted rounded-md text-text-muted disabled:opacity-50 font-label-md cursor-pointer transition-colors hover:bg-bg-surface-hover"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-bg-muted rounded-md text-text-base hover:bg-bg-surface-hover font-label-md cursor-pointer transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 👉 Contact Detail Modal / Popup */}
      {selectedContact && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedContact(null)} // Click outside to close
        >
          <div
            className="bg-bg-surface p-8 rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
          >
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 right-4 text-text-muted hover:text-danger transition-colors cursor-pointer"
            >
              <X  />
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-bg-muted">
              <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-xl font-heading text-brand-primary font-bold">
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-heading text-headline-sm text-text-base">{selectedContact.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-bold capitalize ${selectedContact.status === 'resolved' ? 'bg-success/10 text-success' : 'bg-bg-muted text-text-muted'}`}>
                  {selectedContact.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Email Address</p>
                <p className="font-body-md text-text-base">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Phone Number</p>
                <p className="font-body-md text-text-base">{selectedContact.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-1">Date Received</p>
                <p className="font-body-md text-text-base">{new Date(selectedContact.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-text-muted uppercase mb-2">Message</p>
                <div className="p-4 bg-bg-surface-hover rounded-lg border border-bg-muted/50 max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="font-body-md text-text-base whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-bg-muted">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-5 py-2.5 rounded-lg border border-bg-muted text-text-base hover:bg-bg-surface-hover transition-colors cursor-pointer font-label-md"
              >
                Close
              </button>
              {/* Optional: Add a quick-resolve button inside the modal! */}
              {selectedContact.status !== 'resolved' && (
                <button
                  onClick={() => {
                    toggleStatus(selectedContact._id, selectedContact.status);
                    setSelectedContact(null); // Auto-close modal after resolving
                  }}
                  className="px-5 py-2.5 rounded-lg bg-brand-primary text-text-on-brand hover:bg-brand-primary-container hover:text-text-on-brand-container transition-colors cursor-pointer font-label-md shadow-sm"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  );
};

export default Contacts;