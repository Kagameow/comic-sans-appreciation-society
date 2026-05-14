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

export const currentUser = withItemType<CurrentUser>().defineCollection({
  name: 'currentUser',
})
