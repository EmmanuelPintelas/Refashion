/** @type {import('next').NextConfig} */

const nextConfig = {
  trailingSlash: false,
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
    },
    {
      protocol: "https",
      hostname: "mercur-connect.s3.eu-central-1.amazonaws.com",
    },
    {
      protocol: "https",
      hostname: "api.mercurjs.com",
    },
    {
      protocol: "http",
      hostname: "localhost",
    },
    {
      protocol: "http",
      hostname: "192.168.11.128",
      port: "9000",
      pathname: "/static/**",
    },
    {
      protocol: "https",
      hostname: "api-sandbox.mercurjs.com",
      pathname: "/static/**",
    },
    {
      protocol: "https",
      hostname: "i.imgur.com",
    },
    {
      protocol: "https",
      hostname: "s3.eu-central-1.amazonaws.com",
    },
    {
      protocol: "https",
      hostname: "eztivn6wptm.exactdn.com",
    },
    {
      protocol: "https",
      hostname: "picsum.photos",
    },
    {
      protocol: "https",
      hostname: "loremflickr.com",
    },
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    }
  ],
},
}

module.exports = nextConfig
