import { z } from "zod"

export const registryAgentSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    version: z.string(),
    description: z.string(),
    capabilities: z
      .object({
        skills: z
          .array(
            z.object({
              id: z.string(),
              description: z.string(),
            })
          )
          .optional(),
      })
      .optional(),
    endpoints: z
      .object({
        asap: z.string().optional(),
        ws: z.string().optional(),
      })
      .optional(),
    auth: z
      .object({
        schemes: z.array(z.string()).optional(),
        oauth2: z
          .object({
            authorization_url: z.string().optional(),
            token_url: z.string().optional(),
            scopes: z.array(z.string()).optional(),
          })
          .optional(),
      })
      .optional(),
    sla: z
      .object({
        max_response_time_seconds: z.number().optional(),
      })
      .optional(),
    repository_url: z.string().nullable().optional(),
    documentation_url: z.string().nullable().optional(),
    built_with: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough()

export const registryResponseSchema = z.object({
  agents: z.array(registryAgentSchema),
})

export const revokedAgentSchema = z.object({
  id: z.string(),
  revoked_at: z.string(),
  reason: z.string(),
})

export const revokedResponseSchema = z.object({
  revoked_agents: z.array(revokedAgentSchema),
})
