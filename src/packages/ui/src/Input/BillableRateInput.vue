<script setup>
import TextInput from '@/packages/ui/src/Input/TextInput.vue';
import { formatCents, getOrganizationCurrencySymbol } from '@/packages/ui/src/utils/money';
import { ref, watch } from 'vue';
import { useFocus } from '@vueuse/core';

const props = defineProps({
	name: {
		type: String,
		required: true,
	},
	focus: {
		type: Boolean,
		default: false,
	},
	currency: {
		type: String,
		required: true,
	},
});

const model = defineModel({ default: null });
const billableRateInput = ref(null);
useFocus(billableRateInput, { initialValue: props.focus });

function cleanUpDecimalValue(value) {
	value = value.replace(/,/g, '');
	value = value.replace(props.currency, '');
	return value.replace(/\./g, '');
}

function updateRate(value) {
	value = value.trim();
	if (value.includes(',')) {
		const parts = value.split(',');
		const lastPart = parts[parts.length - 1];
		if (lastPart.length === 2) {
			value = cleanUpDecimalValue(value);
			model.value = parseInt(value);
		}
	} else if (value.includes('.')) {
		const parts = value.split('.');
		const lastPart = parts[parts.length - 1];
		if (lastPart.length === 2) {
			value = cleanUpDecimalValue(value);
			model.value = parseInt(value);
		}
	} else if (value === '') {
		model.value = 0;
	} else {
		const parsedValue = parseInt(cleanUpDecimalValue(value)) * 100;
		if (parsedValue) {
			model.value = parsedValue;
		} else {
			model.value = 0;
		}
	}
	inputValue.value = formatValue(model.value);
}

function formatValue(modelValue) {
	const formattedValue = formatCents(modelValue ?? 0, props.currency);
	return formattedValue.replace(getOrganizationCurrencySymbol(props.currency), '').trim();
}

watch(model, (newValue) => {
	inputValue.value = formatValue(newValue);
});

const inputValue = ref(formatValue(model.value));
</script>

<template>
	<div class="relative">
		<TextInput
			:id="name"
			ref="billableRateInput"
			v-model="inputValue"
			type="text"
			:name="name"
			placeholder="Billable Rate"
			class="block w-full"
			autocomplete="teamMemberRate"
			@blur="updateRate($event.target.value)"
			@keydown.enter="updateRate($event.target.value)"
		/>
		<div class="absolute top-0 right-0 h-full flex items-center px-4 font-medium pointer-events-none">
			<span>
				{{ currency }}
			</span>
		</div>
	</div>
</template>

<style scoped></style>
