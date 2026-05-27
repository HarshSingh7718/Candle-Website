# AI Agent Configuration: Backend

## 1. Project Context
- **App Type**: E-commerce Rest API server
- **Domain Scope**: User verification, cart persistence, transaction processing, Twilio OTP SMS, mailers, and payment webhook verification
- **Framework Constraint**: Node.js, Express v5.x (ESM, `type: "module"`)
- **Deployment Target**: Node.js cloud runner / PaaS

## 2. Exact Build & Test Commands
```bash
npm install
npm run dev
npm start
```

## 3. Permission Boundaries
### ALWAYS DO
- Validate all incoming payloads against robust Zod schemas in the controller/router layer.
- Enforce strict security headers using Helmet and rate limiting via `express-rate-limit`.
- Handle all database interactions within a try/catch block with unified async error handling middleware.
- Sanitize user inputs using `express-mongo-sanitize` and standard XSS protection.

### ASK FIRST
- Modifying Mongoose schemas, adding indexes, or changing structural DB connection logic.
- Adding third-party integrations (e.g. alternative SMS, cloud storage, payment gateway).
- Changing security rules, JWT sign algorithms, or env key bindings.

### NEVER DO
- Write inline database queries or raw Mongoose operations in the route definition layer.
- Hardcode secrets, keys, passwords, or connection strings in code files (use `process.env`).
- Return unhandled exceptions, raw database errors, or stack traces in HTTP responses.

## 4. Code Style & Preferred Patterns
- **Architecture**: Strict Controller-Service-Repository separation of concerns.
- **Validation**: Strict schema-based request validation with Zod.
- **Response Format**: Consistent, structured JSON responses using utility standard structures.

### Preferred Syntax Snippet
```javascript
export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.fetchById(req.params.id);
    return res.status(200).json({ success: true, data: product });
  } catch (error) { next(error); }
};
```

## 5. Explicit Folder Map
- `/src/config`: Connection builders for MongoDB, Redis, Cloudinary, and external services.
- `/src/controllers`: Request parsers, validator triggers, and status executors.
- `/src/db`: Mongoose base schemas and seeding scripts.
- `/src/middleware`: Auth validation, rate limiters, security guards, and error handler blocks.
- `/src/models`: Database documents, schema validation hooks, and custom queries.
- `/src/routes`: Express route trees mapped strictly to handler groups.
- `/src/services`: Core e-commerce domain operations and business logic calculations.
- `/src/utils`: Custom crypto, mail templates, phone formatters, and SMS modules.
- `/src/validators`: Zod verification schemas.
- `/src/webhooks`: Payment verification endpoints.

## 6. Workflow Rules
- **Directory Constraint**: Never propose or execute `cd` commands. All commands must be run within correct working directory.
- **File Reference**: Use absolute workspace paths in output responses.
- **Commit Format**: Conform strictly to Conventional Commits:
  - `feat(backend): <message>`
  - `fix(backend): <message>`
  - `chore(backend): <message>`
