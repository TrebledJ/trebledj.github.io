<template>
  <div class="slidev-layout agenda">
    <div class="relative flex flex-col">
      <div class="flex-none">
        <slot name="title" />
      </div>
      
      <div class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-4xl">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(ol) {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: list-item;
}

:deep(li) {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(70, 130, 255, 0.25);
  color: #e8f0fe;
  font-size: 1.1rem;
}

:deep(li:last-child) {
  border-bottom: none;
}

:deep(li::before) {
  content: counter(list-item);
  counter-increment: list-item;
  font-size: 1.25rem;
  font-weight: 700;
  color: #7ab7ff;
  min-width: 2.5rem;
  font-feature-settings: "tnum";
}

:deep(li strong) {
  color: #e8f0fe;
  font-weight: 600;
  flex: 1;
}

:deep(li code) {
  color: #7ab7ff;
  opacity: 0.7;
  font-style: normal;
  font-size: 0.875rem;
  background: transparent;
  font-weight: 400;
  min-width: 4rem;
  text-align: right;
}

:deep(li .desc) {
  color: #e8f0fe;
  opacity: 0.6;
  font-size: 0.9rem;
  flex: 1.5;
}
</style>