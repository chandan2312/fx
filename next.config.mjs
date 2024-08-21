/** @type {import('next').NextConfig} */
const nextConfig = {
	async headers() {
		return [
			{
				source: "/api/alerts/get",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
				],
			},
			{
				source: "/api/alerts/add",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
				],
			},
			{
				source: "/api/alerts/delete",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
				],
			},
			{
				source: "/api/alerts/edit",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
				],
			},
		];
	},
};

export default nextConfig;
