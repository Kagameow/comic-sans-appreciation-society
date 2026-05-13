const COOKIE_KEY = 'font-mode'

export function useFontMode() {
  const cookie = useCookie<'comic' | 'normal'>(COOKIE_KEY, { default: () => 'comic', maxAge: 60 * 60 * 24 * 365 })

  const isComic = computed(() => cookie.value === 'comic')

  function toggle() {
    cookie.value = isComic.value ? 'normal' : 'comic'
    syncClass()
  }

  function syncClass() {
    if (import.meta.server) return
    document.documentElement.classList.toggle('font-normal', !isComic.value)
  }

  onMounted(syncClass)

  return { isComic, toggle }
}
