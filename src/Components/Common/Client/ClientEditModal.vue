<script setup>
import TextInput from '@/packages/ui/src/Input/TextInput.vue';
import SecondaryButton from '@/packages/ui/src/Buttons/SecondaryButton.vue';
import DialogModal from '@/packages/ui/src/DialogModal.vue';
import { ref } from 'vue';
import PrimaryButton from '@/packages/ui/src/Buttons/PrimaryButton.vue';
import { useFocus } from '@vueuse/core';
import { useClientsStore } from '@/utils/useClients';

const { updateClient } = useClientsStore();
const show = defineModel('show', { default: false });
const saving = ref(false);

const props = defineProps({ client: Object });

const clientBody = ref({
	name: props.client.name,
});

async function submit() {
	await updateClient(props.client.id, clientBody.value);
	show.value = false;
}

const clientNameInput = ref(null);
useFocus(clientNameInput, { initialValue: true });
</script>

<template>
	<DialogModal closeable :show="show" @close="show = false">
		<template #title>
			<div class="flex space-x-2">
				<span> Update Client </span>
			</div>
		</template>

		<template #content>
			<div class="flex items-center space-x-4">
				<div class="col-span-6 sm:col-span-4 flex-1">
					<TextInput
						id="clientName"
						ref="clientNameInput"
						v-model="clientBody.name"
						type="text"
						placeholder="Client Name"
						class="mt-1 block w-full"
						required
						autocomplete="clientName"
						@keydown.enter="submit"
					/>
				</div>
			</div>
		</template>
		<template #footer>
			<SecondaryButton @click="show = false"> Cancel </SecondaryButton>

			<PrimaryButton class="ms-3" :class="{ 'opacity-25': saving }" :disabled="saving" @click="submit">
				Update Client
			</PrimaryButton>
		</template>
	</DialogModal>
</template>

<style scoped></style>
