<template>
  <div class="slidev-layout two-cols-header">
    <div class="relative h-full flex flex-col">
      <!-- Header (full width) -->
      <div class="flex-none">
        <slot />
      </div>
      
      <!-- Two columns -->
      <div class="flex gap-1">
        <div class="flex-1 col-left">
          <slot name="left" />
        </div>
        <div class="flex-1 col-right">
          <slot name="right" />
        </div>
      </div>
      
      <!-- bottom block (full width) -->
      <div class="flex-none col-bottom">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>
