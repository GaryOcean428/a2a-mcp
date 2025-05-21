# MCP Integration Platform - Implementation Task List

This document catalogs missing or incomplete features identified during the audit of the `/docs` directory against the actual codebase. Each task includes a complexity estimate, dependencies, blocking factors, and success criteria.

## 1. Documentation

### 1.1 Create Roadmap
- **Description**: `roadmap.md` referenced in the docs is missing.
- **Complexity**: Low
- **Dependencies**: none
- **Blocking Factors**: project maintainers need to provide high‑level plans
- **Technical Approach**: Draft `docs/roadmap.md` summarizing planned phases and features. Link from README and documentation index.
- **Success Criteria**: `docs/roadmap.md` exists and outlines upcoming milestones; linked from main docs.

### 1.2 Align API documentation with implementation
- **Description**: API docs reference `/api/keys` and `/api/auth/*` paths that are not implemented. Actual routes are `/api/user/apikey`, `/api/login`, `/api/register`, etc.
- **Complexity**: Medium
- **Dependencies**: knowledge of existing routes
- **Blocking Factors**: none
- **Technical Approach**: Update `API_DOCUMENTATION.md` and `api-docs.yaml` to reflect actual endpoints, or implement missing routes if required.
- **Success Criteria**: Documentation and code agree on available endpoints.

## 2. Web Search Feature
- **Missing Items**:
  - Domain filtering (`include_domains`, `exclude_domains`)
  - Time range filtering (`time_period`)
  - Support for `max_results` parameter name
- **Complexity**: Medium
- **Dependencies**: provider API capabilities
- **Blocking Factors**: API limitations from Tavily/Perplexity/OpenAI
- **Technical Approach**:
  1. Extend `WebSearchParams` in `shared/schema.ts` to include these fields.
  2. Propagate parameters through `MCPService` and `webSearchService`.
  3. Apply filters when calling providers or post‑process results.
- **Success Criteria**: Requests with new fields are accepted and reflected in search results; OpenAPI spec updated.

## 3. Form Automation Feature
- **Missing Items**:
  - Actual browser automation (headless browsing)
  - Custom field selectors and validation logic
  - Navigation waiting and screenshot capture
- **Complexity**: High
- **Dependencies**: headless browser library (e.g., Puppeteer)
- **Blocking Factors**: environment support for browsers
- **Technical Approach**:
  1. Replace placeholder HTTP request logic with Puppeteer based implementation.
  2. Support field selectors, checkboxes, dropdowns, and navigation events.
  3. Capture screenshots and return final page info as in docs.
- **Success Criteria**: Form automation examples from docs execute successfully and return expected response structure.

## 4. Vector Storage Feature
- **Missing Items**:
  - `embedding_model`, `namespace`, `batch_size`
  - Hybrid search and keyword weighting
  - Consistent operation names in schema (`store`, `search`, `retrieve`, `delete`)
- **Complexity**: Medium
- **Dependencies**: Pinecone or Weaviate client capabilities
- **Blocking Factors**: none
- **Technical Approach**:
  1. Update `VectorStorageParams` schema and OpenAPI spec.
  2. Extend `vector-storage-service.ts` to accept new parameters and pass them to the selected DB implementation.
  3. Add hybrid search logic combining embeddings and keyword search where supported.
- **Success Criteria**: API requests using new fields perform expected operations; unit tests cover all operations.

## 5. Data Scraping Feature
- **Missing Items**:
  - JavaScript rendering (`render_javascript`)
  - Waiting for selectors and pagination support
  - Advanced selectors, transforms, and nested data extraction
- **Complexity**: High
- **Dependencies**: headless browser or scraping library
- **Blocking Factors**: runtime environment size and network access
- **Technical Approach**:
  1. Integrate a headless browser (Puppeteer/Playwright) into `data-scraping-service.ts`.
  2. Implement selector transformations and pagination loops.
  3. Support output in JSON and CSV as described in docs.
- **Success Criteria**: Examples from `data-scraping.md` produce expected structured results.

## 6. Sandbox Feature Documentation
- **Description**: Sandbox API is implemented but not documented.
- **Complexity**: Low
- **Dependencies**: existing `sandbox-service.ts`
- **Blocking Factors**: none
- **Technical Approach**: Add a new section in documentation describing sandbox operations and parameters; update OpenAPI spec.
- **Success Criteria**: Documentation includes sandbox usage examples and matches implementation.

## 7. Technical Debt
- **Testing Coverage**: Unit and integration tests are largely absent.
  - **Complexity**: Medium
  - **Dependencies**: testing framework setup
  - **Blocking Factors**: None
  - **Technical Approach**: Add Vitest configuration, create tests for services and controllers, aim for at least 70% coverage.
  - **Success Criteria**: `yarn test` executes and coverage metrics reported.
- **Performance Monitoring**: Docs mention future monitoring; no implementation found.
  - **Complexity**: Medium
  - **Technical Approach**: Integrate basic metrics collection (e.g., Prometheus exporter) for request timings and resource usage.
  - **Success Criteria**: Metrics endpoint exposes server stats.

## Prioritization
1. **Documentation Alignment** (Roadmap and API docs) – ensures clarity for developers.
2. **Web Search Enhancements** – medium effort, high user impact.
3. **Vector Storage Improvements** – required for proper semantic search.
4. **Form Automation Implementation** – high complexity but core feature.
5. **Data Scraping Enhancements** – high complexity, valuable for data gathering.
6. **Sandbox Documentation** – low effort.
7. **Technical Debt: Testing & Monitoring** – ongoing quality improvements.

