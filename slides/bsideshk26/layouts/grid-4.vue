<template>
  <div class="slidev-layout grid-4">
    <div class="relative flex flex-col">
      <!-- Default slot for title -->
      <div class="flex-none">
        <slot />
      </div>
      
      <!-- 2x2 Grid -->
      <div class="flex-1 flex items-center justify-center">
        <div class="w-full max-w-7xl grid grid-cols-2 gap-6">
          <div class="col">
            <slot name="cell1" />
          </div>
          <div class="col">
            <slot name="cell2" />
          </div>
          <div class="col">
            <slot name="cell3" />
          </div>
          <div class="col">
            <slot name="cell4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.col {
  color: #e8f0fe;
}

.col :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(70, 130, 255, 0.2);
}

.col :deep(*:not(img)) {
  color: #e8f0fe;
}
</style>