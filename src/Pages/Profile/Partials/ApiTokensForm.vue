<script setup>
import FormSection from '@/Components/FormSection.vue';
import PrimaryButton from '@/packages/ui/src/Buttons/PrimaryButton.vue';
import { computed, ref } from 'vue';
import InputLabel from '@/packages/ui/src/Input/InputLabel.vue';
import { api } from '@/packages/api/src';
import SectionBorder from '@/Components/SectionBorder.vue';
import DangerButton from '@/packages/ui/src/Buttons/DangerButton.vue';
import TextInput from '../../../packages/ui/src/Input/TextInput.vue';
import SecondaryButton from '../../../packages/ui/src/Buttons/SecondaryButton.vue';
import DialogModal from '@/packages/ui/src/DialogModal.vue';
import InputError from '@/packages/ui/src/Input/InputError.vue';
import ActionMessage from '@/Components/ActionMessage.vue';
import ConfirmationModal from '@/Components/ConfirmationModal.vue';
import ActionSection from '@/Components/ActionSection.vue';
import { useForm } from '@/utils/inertia';
import { useMutation, useQuery, useQueryClient } from '@/utils/tanstack';
import { useNotificationsStore } from '@/utils/notification';
import { useClipboard } from '@vueuse/core';
import { formatDateTimeLocalized } from '../../../packages/ui/src/utils/time';
import { ClockIcon } from '@heroicons/vue/20/solid';

const queryClient = useQueryClient();

const apiTokenBeingDeleted = ref(null);
const apiTokenBeingRevoked = ref(null);
const { handleApiRequestNotifications } = useNotificationsStore();
const newToken = ref('');
const { copy, copied, isSupported } = useClipboard();
const createApiTokenForm = useForm({ name: '' });

async function createApiToken() {
	await handleApiRequestNotifications(
		() =>
			createApiTokenMutation.mutateAsync({
				name: createApiTokenForm.name,
			}),
		'API Token successfully created',
		'There was an error while creating the API Token',
		(response) => {
			createApiTokenForm.name = '';
			displayingToken.value = true;
			newToken.value = response.data.access_token;
		}
	);
}

function confirmApiTokenDeletion(token) {
	apiTokenBeingDeleted.value = token;
}

function confirmApiTokenRevocation(token) {
	apiTokenBeingRevoked.value = token;
}

const displayingToken = ref(false);

async function deleteApiToken() {
	if (apiTokenBeingDeleted.value) {
		await handleApiRequestNotifications(
			() => deleteApiTokenMutation.mutateAsync(apiTokenBeingDeleted.value.id),
			'API Token successfully deleted',
			'There was an error while deleting the API Token',
			() => {
				apiTokenBeingDeleted.value = null;
			}
		);
	}
}

async function revokeApiToken() {
	if (apiTokenBeingRevoked.value) {
		await handleApiRequestNotifications(
			() => revokeApiTokenMutation.mutateAsync(apiTokenBeingRevoked.value.id),
			'API Token successfully revoked',
			'There was an error while revoking the API Token',
			() => {
				apiTokenBeingRevoked.value = null;
			}
		);
	}
}

const { data: sharedReportResponseData } = useQuery({
	queryKey: ['api-tokens'],
	queryFn: () => api.getApiTokens(),
});

const tokens = computed(() => {
	return sharedReportResponseData.value?.data ?? [];
});

const createApiTokenMutation = useMutation({
	mutationFn: async (apiToken) => {
		return await api.createApiToken(apiToken);
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
	},
});

const deleteApiTokenMutation = useMutation({
	mutationFn: async (apiTokenId) => {
		return await api.deleteApiToken(undefined, {
			params: {
				apiToken: apiTokenId,
			},
		});
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
	},
});

const revokeApiTokenMutation = useMutation({
	mutationFn: async (apiTokenId) => {
		return await api.revokeApiToken(undefined, {
			params: {
				apiToken: apiTokenId,
			},
		});
	},
	onSuccess: () => {
		queryClient.invalidateQueries({ queryKey: ['api-tokens'] });
	},
});
</script>

<template>
	<div>
		<FormSection @submitted="createApiToken">
			<template #title>Create API Token</template>

			<template #description>
				API tokens allow third-party services to authenticate with our application on your behalf.
			</template>

			<template #form>
				<div class="col-span-6 sm:col-span-4">
					<InputLabel for="api_key_name" value="API Key Name" />
					<TextInput id="api_key_name" v-model="createApiTokenForm.name" type="text" class="mt-1 block w-full" />
					<InputError :message="createApiTokenForm.errors.name" class="mt-2" />
					<div class="text-text-tertiary text-sm pt-3 flex space-x-1.5 font-medium items-center">
						<ClockIcon class="w-4" />
						<span>API Tokens are valid for 1 year</span>
					</div>
				</div>
			</template>

			<template #actions>
				<ActionMessage :on="createApiTokenForm.recentlySuccessful" class="me-3"> Created. </ActionMessage>

				<PrimaryButton
					:class="{ 'opacity-25': createApiTokenForm.processing }"
					:disabled="createApiTokenForm.processing"
				>
					Create API Key
				</PrimaryButton>
			</template>
		</FormSection>

		<div v-if="tokens.length > 0">
			<SectionBorder />

			<div class="mt-10 sm:mt-0">
				<ActionSection>
					<template #title>Manage API Tokens</template>

					<template #description>
						You may delete or revoke any of your existing tokens if they are no longer needed.
					</template>

					<template #content>
						<div class="divide-border-secondary divide-y">
							<div v-for="token in tokens" :key="token.id" class="flex items-center py-2.5 justify-between">
								<div class="break-all text-text-primary">
									<div>{{ token.name }}</div>
									<div class="text-sm text-text-tertiary space-x-3">
										<span v-if="token.created_at"> Created at {{ formatDateTimeLocalized(token.created_at) }} </span>
										<span v-if="token.expires_at"> Expires at {{ formatDateTimeLocalized(token.expires_at) }} </span>
										<span v-if="token.revoked">Revoked</span>
									</div>
								</div>

								<div class="flex items-center ms-2">
									<div v-if="token.last_used_ago" class="text-sm text-gray-400">
										Last used {{ token.last_used_ago }}
									</div>
									<button
										v-if="!token.revoked"
										class="cursor-pointer ms-6 text-sm text-text-secondary"
										:aria-label="'Revoke API Token ' + token.name"
										@click="confirmApiTokenRevocation(token)"
									>
										Revoke
									</button>
									<button
										class="cursor-pointer ms-6 text-sm text-red-500"
										:aria-label="'Delete API Token ' + token.name"
										@click="confirmApiTokenDeletion(token)"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					</template>
				</ActionSection>
			</div>
		</div>

		<DialogModal :show="displayingToken" @close="displayingToken = false">
			<template #title>API Token created successfully</template>

			<template #content>
				<div>
					Please copy your new API token. For your security, it won't be shown again.
					<strong>This token is valid for one year</strong> unless you revoke it.
				</div>

				<div></div>

				<div class="flex gap-2 pt-6 w-full">
					<TextInput v-if="newToken" disabled :model-value="newToken" class="flex-1 text-gray-500" />
					<PrimaryButton v-if="isSupported" @click="copy(newToken)">
						{{ copied ? 'Copied!' : 'Copy Token' }}
					</PrimaryButton>
				</div>
			</template>

			<template #footer>
				<SecondaryButton @click="displayingToken = false"> Close </SecondaryButton>
			</template>
		</DialogModal>

		<ConfirmationModal :show="apiTokenBeingDeleted != null" @close="apiTokenBeingDeleted = null">
			<template #title>Delete API Token</template>

			<template #content>Are you sure you would like to delete this API token?</template>

			<template #footer>
				<SecondaryButton @click="apiTokenBeingDeleted = null"> Cancel </SecondaryButton>

				<DangerButton
					class="ms-3"
					:class="{ 'opacity-25': createApiTokenMutation.isPending.value }"
					:disabled="createApiTokenMutation.isPending.value"
					@click="deleteApiToken"
				>
					Delete
				</DangerButton>
			</template>
		</ConfirmationModal>

		<ConfirmationModal :show="apiTokenBeingRevoked != null" @close="apiTokenBeingRevoked = null">
			<template #title>Revoke API Token</template>

			<template #content>Are you sure you would like to revoke this API token?</template>

			<template #footer>
				<SecondaryButton @click="apiTokenBeingRevoked = null"> Cancel </SecondaryButton>

				<DangerButton
					class="ms-3"
					:class="{ 'opacity-25': revokeApiTokenMutation.isPending.value }"
					:disabled="revokeApiTokenMutation.isPending.value"
					@click="revokeApiToken"
				>
					Revoke
				</DangerButton>
			</template>
		</ConfirmationModal>
	</div>
</template>
