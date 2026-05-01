import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const initialQueries = [
  {
    id: 1,
    name: 'Eleanor Vance',
    email: 'eleanor.v@example.com',
    subject: 'Wholesale Inquiry',
    date: 'Oct 24, 2023',
    status: 'Unsolved'
  },
  {
    id: 2,
    name: 'Julian Blackwood',
    email: 'j.blackwood@example.com',
    subject: 'Shipping Delay',
    date: 'Oct 23, 2023',
    status: 'Unsolved'
  },
  {
    id: 3,
    name: 'Clara Oswald',
    email: 'clara.o@example.com',
    subject: 'Product Care Advice',
    date: 'Oct 21, 2023',
    status: 'Solved'
  },
  {
    id: 4,
    name: 'Marcus Thorne',
    email: 'm.thorne@example.com',
    subject: 'Custom Order Request',
    date: 'Oct 20, 2023',
    status: 'Solved'
  },
  {
    id: 5,
    name: 'Sophia Rossi',
    email: 's.rossi@example.com',
    subject: 'Return Policy Clarification',
    date: 'Oct 19, 2023',
    status: 'Solved'
  }
];

const Contacts = () => {
  const [queries, setQueries] = useState(initialQueries);
  const [searchQuery, setSearchQuery] = useState('');

  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  useEffect(() => {
    // Fade + slide up entire page content
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  // Separate effect for rows to re-animate when filtering changes
  useEffect(() => {
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [searchQuery]);

  const toggleStatus = (id) => {
    setQueries(queries.map(query => {
      if (query.id === id) {
        return { ...query, status: query.status === 'Solved' ? 'Unsolved' : 'Solved' };
      }
      return query;
    }));
  };

  const filteredQueries = queries.filter(query => {
    const searchLower = searchQuery.toLowerCase();
    return (
      query.name.toLowerCase().includes(searchLower) ||
      query.email.toLowerCase().includes(searchLower) ||
      query.subject.toLowerCase().includes(searchLower)
    );
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full pb-20 flex-1">
      
      {/* Page Header */}
      <div className="mb-stack-lg">
        <h2 className="font-heading text-headline-xl text-on-surface mb-2">Customer Support</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Manage and respond to customer inquiries and feedback.</p>
      </div>

      {/* Queries List Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest shadow-sm overflow-hidden p-stack-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-md pb-stack-sm border-b border-surface-container-high gap-4">
          <h3 className="font-heading text-headline-md text-on-surface">Recent Queries</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface-container rounded-lg border-none focus:ring-2 focus:ring-primary text-body-md font-body-md placeholder-on-surface-variant transition-all" 
                placeholder="Search queries..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer">
              <span className="material-symbols-outlined">filter_list</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-container-high">
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Subject</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Date Received</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => (
                <tr 
                  key={query.id} 
                  ref={addToRowsRef}
                  className="border-b border-surface-container-high hover:bg-surface-container-low transition-colors group"
                >
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md font-semibold text-on-surface">{query.name}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">{query.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-body-md text-body-md text-on-surface">{query.subject}</td>
                  <td className="py-4 px-4 font-body-md text-body-md text-on-surface-variant">{query.date}</td>
                  <td className="py-4 px-4">
                    {query.status === 'Solved' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-[#e8eedd] text-[#4b5d3a] border border-[#d1e0c0]">
                        Solved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-high text-on-surface-variant border border-surface-dim">
                        Unsolved
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => toggleStatus(query.id)}
                      className="text-primary hover:text-on-primary-fixed-variant transition-colors font-label-md text-label-md cursor-pointer"
                    >
                      {query.status === 'Solved' ? 'Reopen' : 'Resolve'}
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQueries.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                    No queries found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-stack-md flex flex-col sm:flex-row justify-between items-center pt-stack-sm border-t border-surface-container-high gap-4">
          <span className="font-label-md text-label-md text-on-surface-variant">Showing 1 to {Math.min(5, filteredQueries.length)} of 24 queries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-outline-variant rounded-md text-on-surface-variant disabled:opacity-50 font-label-md cursor-pointer" disabled>Prev</button>
            <button className="px-3 py-1 border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-low font-label-md cursor-pointer">Next</button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contacts;
