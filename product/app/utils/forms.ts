import type { FormErrorEvent } from '#ui/types'

/**
 * Composed across every `<UForm @error="focusFirstError">` in the app — when
 * Nuxt UI's UForm fires a validation error, focus and scroll the first
 * invalid field into view. UForm emits a `FormErrorEvent` whose `errors[].id`
 * matches the DOM id of the offending UFormField.
 */
export function focusFirstError(event: FormErrorEvent) {
  const firstId = event.errors[0]?.id
  if (!firstId)
    return
  const el = document.getElementById(firstId)
  el?.focus()
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
