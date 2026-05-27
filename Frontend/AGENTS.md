# AI Agent Configuration: Frontend

## 1. Project Context
- **App Type**: E-commerce / Candle E-store client application
- **Domain Scope**: User authentication, product browsing, custom candle builder, shopping cart, checkout, payments, and order tracking
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
- Execute linting (`npm run lint`) and build (`npm run build`) checks before completing any task.
- Use native Tailwind CSS v4 directives for styling layout, spacing, and standard UI elements.
- Use explicit TypeScript/JavaScript standard ES6 modules (import/export).
- Double-check component responsiveness across standard breakpoints (320px, 768px, 1024px, 1440px).

### ASK FIRST
- Installing any new external npm dependencies or changing major dependency versions.
- Introducing a new global React state context or modifying routing paths in `src/App.jsx`.
- Modifying standard Vite config trees (`vite.config.js`) or configuration files.

### NEVER DO
- Mix Tailwind utility classes inside Material UI `sx` or `styled` tokens (keep styling paradigms separate).
- Hardcode API endpoints, keys, client secrets, or sensitive configuration options (always use `import.meta.env`).
- Commit inline `useEffect` fetching logic; always wrap API integrations inside TanStack React-Query hooks.

## 4. Code Style & Preferred Patterns
- **State & Data**: TanStack React-Query v5 custom hooks for API calls, caching, and mutations.
- **Styling**: Tailwind CSS v4 for general page layout and custom components; MUI v9 exclusively for standardized premium UI controls.
- **Animations**: GSAP with the `@gsap/react` hook for rich, responsive page transitions and scroll triggers.
- **Routing**: React Router v7 standard declarative route mapping.

### Preferred Syntax Snippet
```javascript
export const useProductData = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => (await axios.get(`/api/v1/products/${productId}`)).data,
    staleTime: 5 * 60 * 1000,
  });
};
```

## 5. Explicit Folder Map
- `/public`: Static public assets, global fonts, logos, and images.
- `/src/components`: Reusable presentational components and high-fidelity MUI widgets.
- `/src/hooks`: Custom hooks managing domain logic, mutations, query hooks, and context bindings.
- `/src/pages`: Top-level page templates linked directly to route controllers.
- `/src/utils`: Axios instances, formatters, and third-party helpers (Google Auth, Razorpay).
- `/src/App.jsx`: Main routing setup and application container.
- `/src/index.css`: Tailwind CSS configuration and baseline design token definitions.

## 6. Workflow Rules
- **Directory Constraint**: Never propose or execute `cd` commands. All command executions must use explicit `--prefix` parameters or run within current context Cwd.
- **File Reference**: Use absolute local workspace paths for file reference logs.
- **Commit Format**: Conform strictly to Conventional Commits:
  - `feat(frontend): <message>` (new feature)
  - `fix(frontend): <message>` (bug fix)
  - `refactor(frontend): <message>` (code restructuring)
