# AI Agent Configuration: Admin Panel

## 1. Project Context
- **App Type**: Back-office management portal / dashboard application
- **Domain Scope**: Inventory management, order fulfillment, refund execution, sales reporting, and user role management
- **Framework Constraint**: React 19.x (ESM), Vite 8.x
- **Deployment Target**: Vercel

## 2. Exact Build & Test Commands
```bash
npm install
npm run dev
npm run build
npm run lint
```

## 3. Permission Boundaries
### ALWAYS DO
- Ensure all charts, tables, and pagination systems handle empty state and load loading skeleton indicators seamlessly.
- Enforce strict role-based access control checking on every page transition.
- Verify production build optimization and run eslint checks before closing features.

### ASK FIRST
- Modifying shared state wrappers, auth providers, or critical routes in `src/App.jsx`.
- Changing layout components or modifying dashboard grid structures.
- Integrating external data sources outside the core REST API interface.

### NEVER DO
- Hardcode status codes, category tags, or enum list types; use unified configurations in utilities.
- Allow plain inline inputs without validation handlers or validation schemas.
- Write direct local storage reads/writes inside elements; abstract into an Auth Context or custom hooks.

## 4. Code Style & Preferred Patterns
- **State & Query**: Axios + React Query v5 for REST sync; local UI state kept to React hooks.
- **Data Table**: Reusable tabular structures leveraging Tailwind CSS with clean pagination handlers.
- **Charts**: Interactive, accessible visuals designed via Recharts with responsive standard wrappers.

### Preferred Syntax Snippet
```javascript
export const useAdminOrders = (filters) => {
  return useQuery({
    queryKey: ['adminOrders', filters],
    queryFn: async () => (await axios.get('/api/v1/admin/orders', { params: filters })).data,
    keepPreviousData: true,
  });
};
```

## 5. Explicit Folder Map
- `/src/components`: UI charts, grid blocks, statistics panels, and reusable custom table widgets.
- `/src/context`: Auth guards, theme contexts, and sidebar toggle behaviors.
- `/src/hooks`: Global custom data loaders, TanStack Query connectors.
- `/src/pages`: Analytics, Inventory, Orders, Settings, and User Management modules.
- `/src/api.js`: Common configured Axios instances and interceptor configurations.
- `/src/index.css`: Global base styles, Tailwind setup, and customized design system tokens.

## 6. Workflow Rules
- **Directory Constraint**: Never propose or execute `cd` commands. All command executions must remain Cwd-bound.
- **File Reference**: Rely on absolute workspace paths.
- **Commit Format**: Conform strictly to Conventional Commits:
  - `feat(admin): <message>`
  - `fix(admin): <message>`
  - `refactor(admin): <message>`
