<script setup>
defineProps({
	title: String,
	value: String,
});
</script>

<template>
	<div class="rounded-lg bg-card-background border-card-border shadow-card border px-3.5 py-2.5">
		<dt class="font-semibold text-sm text-muted">{{ title }}</dt>
		<dd class="text-2xl text-text-primary pt-1 font-semibold">
			{{ value }}
		</dd>
	</div>
</template>

<style scoped></style>
