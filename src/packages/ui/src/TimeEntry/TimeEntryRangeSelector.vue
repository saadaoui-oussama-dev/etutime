<script setup>
import Dropdown from '@/packages/ui/src/Input/Dropdown.vue';
import { defineProps, ref } from 'vue';
import { formatDateLocalized, formatStartEnd } from '@/packages/ui/src/utils/time';
import TimeRangeSelector from '@/packages/ui/src/Input/TimeRangeSelector.vue';
import { twMerge } from 'tailwind-merge';

defineProps({
	start: String,
	end: String | null,
	showDate: {
		type: Boolean,
		required: false,
	},
});

const emit = defineEmits(['changed']);
const open = ref(false);
const triggerElement = ref(null);
</script>

<template>
	<div class="relative">
		<Dropdown v-model="open" :align="'bottom'" :close-on-content-click="false" @submit="open = false">
			<template #trigger>
				<button
					ref="triggerElement"
					data-testid="time_entry_range_selector"
					:class="
						twMerge(
							'text-muted w-[110px] px-2 bg-transparent text-center hover:bg-card-background rounded-lg border border-transparent hover:border-card-border focus-visible:outline-none focus:outline-none focus-visible:ring-2 focus-visible:text-text-primary focus-visible:ring-ring focus-visible:bg-tertiary',
							showDate ? 'text-xs py-1.5 font-semibold' : 'text-sm py-1.5 font-medium',
							open && 'border-card-border bg-card-background'
						)
					"
				>
					{{ formatStartEnd(start, end) }}
					<span v-if="showDate" class="text-text-tertiary font-medium">{{ formatDateLocalized(start) }} </span>
				</button>
			</template>
			<template #content>
				<TimeRangeSelector
					focus
					:start="start"
					:end="end"
					@changed="(newStart, newEnd) => emit('changed', newStart, newEnd)"
					@close="open = false"
				>
				</TimeRangeSelector>
			</template>
		</Dropdown>
	</div>
</template>

<style></style>
