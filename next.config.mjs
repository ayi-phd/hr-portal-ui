/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: deployed as plain files (S3 + CloudFront), not a Node
  // server — this is why there is no Next.js API route in this app; the
  // Policies Assistant calls the FastAPI backend directly, and Documents
  // Upload is a client-only placeholder (see CLAUDE.md).
  output: "export",
  // Served at https://fractalai.cloud/hr-portal/* alongside other apps on
  // the same CloudFront distribution/S3 bucket.
  basePath: "/hr-portal",
};

export default nextConfig;
