import * as v from 'valibot'

/**
 * Singleton collection representing the auth session. The single item id
 * is the literal 'current'. `email` and `password` are create-only inputs
 * (the createForm form binds to them); they're not persisted in the cache
 * because the supabase-auth plugin discards them after signInWithPassword.
 */
export interface Session {
  id: 'current'
  email?: string
  password?: string
}

const loginSchema = v.object({
  email: v.pipe(v.string(), v.trim(), v.email('Enter a valid email')),
  password: v.pipe(v.string(), v.minLength(6, 'Must be at least 6 characters')),
})

export const session = withItemType<Session>().defineCollection({
  name: 'session',
  formSchema: {
    create: loginSchema,
  },
})
