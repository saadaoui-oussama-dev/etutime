<script setup>
import { computed } from 'vue';

const props = defineProps({
	href: { type: String, required: false },
	active: { type: Boolean, required: false },
});

const classes = computed(() => {
	return props.active
		? 'inline-flex items-center px-1 pt-1 border-b-2 border-indigo-400 text-sm font-medium leading-5 text-gray-900 focus:outline-none focus:border-indigo-700 transition duration-150 ease-in-out'
		: 'inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out';
});
</script>

<template>
	<router-link :href="href ?? ''" :class="classes">
		<slot></slot>
	</router-link>
</template>
