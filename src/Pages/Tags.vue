<script setup>
import MainContainer from '@/packages/ui/src/MainContainer.vue';
import AppLayout from '@/Layouts/AppLayout.vue';
import { TagIcon, PlusIcon } from '@heroicons/vue/16/solid';
import SecondaryButton from '@/packages/ui/src/Buttons/SecondaryButton.vue';
import { ref } from 'vue';
import TagTable from '@/Components/Common/Tag/TagTable.vue';
import TagCreateModal from '@/packages/ui/src/Tag/TagCreateModal.vue';
import PageTitle from '@/Components/Common/PageTitle.vue';
import { canCreateTags } from '@/utils/permissions';
import { useTagsStore } from '@/utils/useTags';

const showCreateTagModal = ref(false);

async function createTag(tag) {
	return await useTagsStore().createTag(tag);
}
</script>

<template>
	<AppLayout title="Tags" data-testid="tags_view">
		<MainContainer class="py-5 border-b border-default-background-separator flex justify-between items-center">
			<div class="flex items-center space-x-6">
				<PageTitle :icon="TagIcon" title="Tags"></PageTitle>
			</div>
			<SecondaryButton v-if="canCreateTags()" :icon="PlusIcon" @click="showCreateTagModal = true"
				>Create Tag
			</SecondaryButton>
			<TagCreateModal v-model:show="showCreateTagModal" :create-tag="createTag"></TagCreateModal>
		</MainContainer>
		<TagTable :create-tag="createTag"></TagTable>
	</AppLayout>
</template>
