/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	transpilePackages: ["@acme/server", "@acme/env", "@acme/typescript"],
}

export default nextConfig
