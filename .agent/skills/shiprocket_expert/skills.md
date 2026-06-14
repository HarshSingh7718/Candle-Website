# Shiprocket Logistics Expert

## Description
This skill provides complete knowledge over the Shiprocket shipping API. Activate this skill whenever the user asks about creating shipping orders, tracking shipments, verifying courier serviceability, handling authentication, or structuring payloads for Shiprocket HTTP endpoints.

## Actions
- **Retrieve Schema**: Look up the exact endpoint URL, headers, request body structure, or expected JSON response from `references/shiprocket_api_docs.json`.
- **Validate Payload**: Match user-provided variables against the formal schema specifications contained in the reference files before generating code or execution instructions.

## Guidelines
- Do not guess key names or parameter requirements. 
- Always cross-reference `references/shiprocket_api_docs.json` for exact keys like `pickup_location`, `order_items`, and mandatory headers like `Authorization: Bearer`.
