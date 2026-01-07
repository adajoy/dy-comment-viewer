import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  baseURL: '/comment-view',
  experimental: {
    openAPI: true,
  },
})

