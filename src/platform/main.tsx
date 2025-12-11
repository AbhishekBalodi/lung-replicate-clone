/**
 * Platform App Entry Point
 * 
 * This is the entry point for the SaaS Platform application.
 * In production, this would be built and deployed separately
 * at admin.yourplatform.com
 * 
 * To build platform app separately:
 * 1. Create a vite.config.platform.ts with entry: src/platform/main.tsx
 * 2. Build with: vite build --config vite.config.platform.ts
 * 3. Deploy to platform domain
 */

import { createRoot } from 'react-dom/client';
import PlatformApp from './PlatformApp';
import '../index.css';

createRoot(document.getElementById("root")!).render(<PlatformApp />);
