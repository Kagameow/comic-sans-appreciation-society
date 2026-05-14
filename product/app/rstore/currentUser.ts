import * as v from 'valibot'

/**
 * The signed-in Supabase user, surfaced as an rstore collection so forms
 * (display_name, avatar_url) hang off updateForm(uid). Backed by the
 * supabase-auth plugin which maps fetchFirst → auth.getUser and update →
 * auth.updateUser({ data: ... }).
 */
export interface CurrentUser {
  id: string
  email: string | null
  display_name: string
  avatar_url: string | null
}

const updateSchema = v.object({
  display_name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(2, 'At least 2 characters'),
    v.maxLength(40, 'Max 40 characters'),
  ),
})

export const currentUser = withItemType<CurrentUser>().defineCollection({
  name: 'currentUser',
  formSchema: {
    update: updateSchema,
  },
})
