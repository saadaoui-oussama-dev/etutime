<script setup>
import { formatCents } from '@/packages/ui/src/utils/money';
import BillableRateModal from '@/packages/ui/src/BillableRateModal.vue';

const show = defineModel('show', { default: false });
const saving = defineModel('saving', { default: false });

defineProps({
	newBillableRate: {
		type: [Number, null],
		required: false,
	},
	projectName: String,
	currency: String,
});

defineEmits(['submit']);
</script>

<template>
	<BillableRateModal
		v-model:show="show"
		v-model:saving="saving"
		title="Update Project Billable Rate"
		@submit="$emit('submit')"
	>
		<p class="py-1 text-center">
			The billable rate of {{ projectName }} will be updated to
			<strong>{{
				newBillableRate ? formatCents(newBillableRate, currency) : ' the default rate of the organization member'
			}}</strong
			>.
		</p>
		<p class="py-1 text-center font-semibold max-w-md mx-auto">
			Do you want to update all existing time entries, where the project billable rate applies as well?
		</p>
	</BillableRateModal>
</template>

<style scoped></style>
