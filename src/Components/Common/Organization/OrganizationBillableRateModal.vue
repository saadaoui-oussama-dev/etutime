<script setup>
import BillableRateModal from '@/packages/ui/src/BillableRateModal.vue';
import { formatCents } from '@/packages/ui/src/utils/money';

const show = defineModel('show', { default: false });
const saving = defineModel('saving', { default: false });

defineProps({
	newBillableRate: {
		type: [Number, null],
		required: false,
	},
});

defineEmits(['submit']);
</script>

<template>
	<BillableRateModal
		v-model:show="show"
		v-model:saving="saving"
		title="Update Organization Billable Rate"
		@submit="$emit('submit')"
	>
		<p class="py-0.5 text-center">
			The organization billable rate will be updated to
			<strong>{{ newBillableRate ? formatCents(newBillableRate, 'MAD') : ' none.' }}</strong
			>.
		</p>
		<p class="py-0.5 text-center font-semibold">
			Do you want to update all existing time entries, where the organization billable rate applies as well?
		</p>
	</BillableRateModal>
</template>

<style scoped></style>
