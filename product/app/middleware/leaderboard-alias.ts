// Redirects the legacy /leaderboard route to /tv with 301 semantics.
// docs/refactor-plan.md §2 keeps the alias around so muscle memory still
// lands somewhere useful.
export default defineNuxtRouteMiddleware((to) => {
  if (to.path === '/leaderboard')
    return navigateTo('/tv', { redirectCode: 301 })
})
