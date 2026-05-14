<template>
  <div class="w-full max-w-[720px] mx-auto bg-[color:var(--surface-deep)] border border-[color:var(--line)] p-5 sm:p-6 font-mono text-sm sm:text-base text-[color:var(--ink-body)] space-y-1">
    <div><span class="text-[color:var(--vue)]">&gt;</span> git commit -m "VUEGEM1"</div>
    <div><span class="text-[color:var(--red)]">&gt;</span> fatal: not authenticated</div>
    <div><span class="text-[color:var(--vue)]">&gt;</span> run <code class="text-[color:var(--vue)]">git auth login</code> to continue</div>
    <div class="pt-3">
      <UButton
        size="lg"
        color="primary"
        icon="i-lucide-log-in"
        to="/login"
      >
        git auth login →
      </UButton>
    </div>
    <p class="pt-3 text-xs text-[color:var(--ink-muted)]">
      &gt; you can watch the
      <NuxtLink to="/tv" class="text-[color:var(--vue)] hover:underline">
        pipeline status
      </NuxtLink>
      anonymously.
    </p>
  </div>
</template>
