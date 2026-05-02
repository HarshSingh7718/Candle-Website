import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGetContacts, useUpdateContactStatus } from '../hooks/useContacts';

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 👉 New state for the modal popup
  const [selectedContact, setSelectedContact] = useState(null);

  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  // 👉 Fetch from Backend
  const { data, isLoading } = useGetContacts(page, limit);
  const { mutate: updateStatus } = useUpdateContactStatus();

  const queries = data?.contacts || [];
  const totalContacts = data?.totalContacts || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (isLoading) return;
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, [isLoading]);

  useEffect(() => {
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [queries, searchQuery]);

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

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full pb-20 flex-1 opacity-0">

      {/* Page Header */}
      <div className="mb-stack-lg">
        <h2 className="font-heading text-headline-xl text-on-surface mb-2">Customer Support</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Manage and respond to customer inquiries and feedback.</p>
      </div>

      {/* Queries List Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden p-stack-md relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-md pb-stack-sm border-b border-surface-container-high gap-4">
          <h3 className="font-heading text-headline-md text-on-surface">Recent Queries</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md font-body-md placeholder-on-surface-variant transition-all outline-none"
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
              <tr className="border-b border-surface-container-high">
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                {/* 👉 Replaced Subject with Message */}
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Message</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date Received</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => (
                <tr
                  key={query._id}
                  ref={addToRowsRef}
                  // 👉 Triggers popup on row click
                  onClick={() => setSelectedContact(query)}
                  className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{query.name}</span>
                      {/* 👉 Replaced Email with Phone */}
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{query.phone || "No phone provided"}</span>
                    </div>
                  </td>
                  {/* 👉 Show truncated message */}
                  <td className="py-4 px-4 font-body-md text-body-md text-on-surface max-w-[250px] truncate">
                    {query.message}
                  </td>
                  <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">
                    {new Date(query.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    {query.status === 'resolved' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-[#e8eedd] text-[#4b5d3a] border border-[#d1e0c0] capitalize">
                        {query.status}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant border border-surface-dim capitalize">
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
                      className="text-primary hover:text-on-primary-fixed-variant transition-colors font-label-md text-label-md cursor-pointer"
                    >
                      {query.status === 'resolved' ? 'Reopen' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQueries.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                    No queries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-stack-md flex flex-col sm:flex-row justify-between items-center pt-stack-sm border-t border-surface-container-high gap-4">
          <span className="font-label-md text-label-md text-on-surface-variant">
            Showing {totalContacts === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalContacts)} of {totalContacts} queries
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant disabled:opacity-50 font-label-md cursor-pointer transition-colors hover:bg-surface-container-low"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-low font-label-md cursor-pointer transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 👉 Contact Detail Modal / Popup */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedContact(null)} // Click outside to close
        >
          <div
            className="bg-surface-container-lowest p-8 rounded-2xl max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicking inside from closing it
          >
            <button
              onClick={() => setSelectedContact(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-error transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-variant">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-xl font-heading text-primary">
                {selectedContact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-heading text-headline-sm text-on-surface">{selectedContact.name}</h3>
                <span className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-bold capitalize ${selectedContact.status === 'resolved' ? 'bg-[#e8eedd] text-[#4b5d3a]' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {selectedContact.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">Email Address</p>
                <p className="font-body-md text-on-surface">{selectedContact.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">Phone Number</p>
                <p className="font-body-md text-on-surface">{selectedContact.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-1">Date Received</p>
                <p className="font-body-md text-on-surface">{new Date(selectedContact.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Message</p>
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50 max-h-48 overflow-y-auto custom-scrollbar">
                  <p className="font-body-md text-on-surface whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors cursor-pointer font-label-md"
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
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer font-label-md shadow-sm"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Contacts;