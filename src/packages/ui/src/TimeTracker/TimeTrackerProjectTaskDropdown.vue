<script setup>
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/16/solid';
import Dropdown from '@/packages/ui/src/Input/Dropdown.vue';
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import ProjectDropdownItem from '@/packages/ui/src/Project/ProjectDropdownItem.vue';
import ProjectBadge from '@/packages/ui/src/Project/ProjectBadge.vue';
import Badge from '@/packages/ui/src/Badge.vue';
import { PlusIcon, PlusCircleIcon, MinusIcon, XMarkIcon } from '@heroicons/vue/16/solid';
import ProjectCreateModal from '@/packages/ui/src/Project/ProjectCreateModal.vue';
import { twMerge } from 'tailwind-merge';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';

const task = defineModel('task', { default: null });
const project = defineModel('project', { default: null });
const searchInput = ref(null);
const open = ref(false);
const dropdownViewport = ref(null);
const searchValue = ref('');

const props = defineProps({
	showBadgeBorder: { type: Boolean, default: true },
	size: { type: String, default: 'large' },
	projects: Array,
	tasks: Array,
	clients: Array,
	createProject: Function,
	createClient: Function,
	currency: String,
	emptyPlaceholder: { type: String, default: 'No Project' },
	allowReset: { type: Boolean, default: false },
	enableEstimatedTime: Boolean,
	canCreateProject: Boolean,
	class: { type: String, required: false },
});

watch(open, (isOpen) => {
	if (isOpen) {
		nextTick(() => {
			initializeHighlightedItem();
			searchInput.value?.focus({ preventScroll: true });
		});
	}
});

const filteredResults = ref([]);

const filteredProjects = computed(() => {
	return filteredResults.value.map((client) => client.projects).flat();
});

function addProjectToFilterObject(tempFilteredClients, project, filteredTasks, expanded = false) {
	const projectClientIndex = tempFilteredClients.findIndex((client) => client.id === project.client_id);

	const client = props.clients.find((client) => client.id === project.client_id);

	if (projectClientIndex !== -1) {
		tempFilteredClients[projectClientIndex].projects.push({
			...project,
			expanded: expanded,
			tasks: filteredTasks,
		});
	} else if (client) {
		tempFilteredClients.push({
			...client,
			projects: [
				{
					...project,
					expanded: expanded,
					tasks: filteredTasks,
				},
			],
		});
	} else {
		const customNoClientId = 'no_client';
		const noClientIndex = tempFilteredClients.findIndex((client) => client.id === customNoClientId);

		if (noClientIndex !== -1) {
			tempFilteredClients[noClientIndex].projects.push({
				...project,
				expanded: expanded,
				tasks: filteredTasks,
			});
		} else {
			tempFilteredClients.push({
				id: customNoClientId,
				name: 'No Client',
				color: 'var(--theme-color-icon-default)',
				created_at: '',
				updated_at: '',
				value: '',
				is_archived: false,
				projects: [
					{
						...project,
						expanded: expanded,
						tasks: filteredTasks,
					},
				],
			});
		}
	}
}

watchEffect(() => {
	const tempFilteredClients = [];

	if (searchValue.value.length === 0) {
		tempFilteredClients.push({
			id: 'no_project_no_client',
			name: 'No Client',
			color: 'var(--theme-color-icon-default)',
			created_at: '',
			updated_at: '',
			value: '',
			is_archived: false,
			projects: [
				{
					id: '',
					name: 'No Project',
					color: 'var(--theme-color-icon-default)',
					value: '',
					client_id: null,
					billable_rate: null,
					is_archived: false,
					is_billable: false,
					expanded: false,
					tasks: [],
					estimated_time: null,
					spent_time: 0,
					is_public: false,
				},
			],
		});
	}

	for (const filterProject of props.projects) {
		const projectNameIncludesSearchTerm = filterProject.name
			.toLowerCase()
			.includes(searchValue.value?.toLowerCase()?.trim() || '');

		const clientNameIncludesSearchTerm = props.clients
			.find((client) => client.id === filterProject.client_id)
			?.name.toLowerCase()
			.includes(searchValue.value?.toLowerCase()?.trim() || '');

		const projectTasks = props.tasks.filter((task) => {
			return task.project_id === filterProject.id;
		});

		const filteredTasks = projectTasks.filter((filterTask) => {
			return (
				filterTask.name.toLowerCase().includes(searchValue.value?.toLowerCase()?.trim() || '') &&
				(!filterTask.is_done || filterTask.id === task.value)
			);
		});

		if (
			(projectNameIncludesSearchTerm || clientNameIncludesSearchTerm) &&
			(!filterProject.is_archived || project.value === filterProject.id)
		) {
			addProjectToFilterObject(tempFilteredClients, filterProject, filteredTasks, false);
		} else if (filteredTasks.length > 0 && !filterProject.is_archived) {
			addProjectToFilterObject(tempFilteredClients, filterProject, filteredTasks, true);
		}
	}

	tempFilteredClients.sort((a, b) => {
		if (a.id === 'no_project_no_client') {
			return -1;
		}
		if (b.id === 'no_project_no_client') {
			return 1;
		}
		if (a.id === 'no_client') {
			return -1;
		}
		if (b.id === 'no_client') {
			return 1;
		}

		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});

	filteredResults.value = tempFilteredClients;
});

async function addClientIfNoneExists() {
	setProjectAndClientBasedOnHighlightedItem();
}

function isProjectSelected(project) {
	return project.value === project.id;
}

function initializeHighlightedItem() {
	if (filteredProjects.value.length > 0) {
		highlightedItemId.value = filteredProjects.value[0].id;
	}
}

watch(filteredProjects, () => {
	initializeHighlightedItem();
});

function setProjectAndClientBasedOnHighlightedItem() {
	const highlightedProject = filteredProjects.value.find((project) => project.id === highlightedItemId.value);
	const highlightedTask = filteredProjects.value
		.map((project) => project.tasks)
		.flat()
		.find((task) => task.id === highlightedItemId.value);
	if (highlightedProject) {
		selectProject(highlightedProject.id);
	}
	if (highlightedTask) {
		selectTask(highlightedTask.id);
	}
}

function updateSearchValue(event) {
	const newInput = event.target.value;
	if (newInput === ' ') {
		searchValue.value = '';
		setProjectAndClientBasedOnHighlightedItem();
	} else {
		searchValue.value = newInput;
	}
}

const emit = defineEmits(['update:modelValue', 'changed']);

function moveHighlightUp() {
	mouseEnterHighlightActivated.value = false;
	const currentHighlightedIndex = filteredProjects.value.findIndex(
		(projectWithTasks) => projectWithTasks.id === highlightedItemId.value
	);
	if (currentHighlightedIndex === -1) {
		const currentProjectWithTasks = filteredProjects.value.find((projectWithTasks) =>
			projectWithTasks.tasks.some((task) => task.id === highlightedItemId.value)
		);
		if (currentProjectWithTasks) {
			const taskIndex = currentProjectWithTasks.tasks.findIndex((task) => task.id === highlightedItemId.value);
			if (taskIndex === -1) {
				return;
			}
			if (taskIndex === 0) {
				highlightedItemId.value = currentProjectWithTasks.id;
				return;
			}
			highlightedItemId.value = currentProjectWithTasks.tasks[taskIndex - 1].id;
		}
	}
	if (currentHighlightedIndex === 0) {
		const lastProject = filteredProjects.value[filteredProjects.value.length - 1];
		if (lastProject.tasks.length > 0 && lastProject.expanded) {
			highlightedItemId.value = lastProject.tasks[lastProject.tasks.length - 1].id;
		} else {
			highlightedItemId.value = filteredProjects.value[filteredProjects.value.length - 1].id;
		}
	} else {
		const previousProject = filteredProjects.value[currentHighlightedIndex - 1];
		if (previousProject.tasks.length > 0 && previousProject.expanded) {
			highlightedItemId.value = previousProject.tasks[previousProject.tasks.length - 1].id;
		} else {
			highlightedItemId.value = filteredProjects.value[currentHighlightedIndex - 1].id;
		}
	}
}

function moveHighlightDown() {
	mouseEnterHighlightActivated.value = false;

	const currentHighlightedIndex = filteredProjects.value.findIndex(
		(projectWithTasks) => projectWithTasks.id === highlightedItemId.value
	);
	if (currentHighlightedIndex === -1) {
		const currentProjectWithTasks = filteredProjects.value.find((projectWithTasks) =>
			projectWithTasks.tasks.some((task) => task.id === highlightedItemId.value)
		);
		if (currentProjectWithTasks) {
			const taskIndex = currentProjectWithTasks.tasks.findIndex((task) => task.id === highlightedItemId.value);
			if (taskIndex === -1) {
				return;
			}
			if (taskIndex === currentProjectWithTasks.tasks.length - 1) {
				const projectIndex = filteredProjects.value.indexOf(currentProjectWithTasks);
				if (projectIndex === filteredProjects.value.length - 1) {
					highlightedItemId.value = filteredProjects.value[0].id;
				} else {
					highlightedItemId.value = filteredProjects.value[projectIndex + 1].id;
				}
				return;
			}
			highlightedItemId.value = currentProjectWithTasks.tasks[taskIndex + 1].id;
		}
	}
	if (currentHighlightedIndex === filteredProjects.value.length - 1) {
		const lastProject = filteredProjects.value[filteredProjects.value.length - 1];
		if (lastProject.tasks.length > 0 && lastProject.expanded) {
			highlightedItemId.value = lastProject.tasks[0].id;
		} else {
			highlightedItemId.value = filteredProjects.value[0].id;
		}
	} else {
		const currentProjectWithTasks = filteredProjects.value[currentHighlightedIndex];
		if (currentProjectWithTasks.tasks.length > 0 && currentProjectWithTasks.expanded) {
			highlightedItemId.value = currentProjectWithTasks.tasks[0].id;
		} else {
			highlightedItemId.value = filteredProjects.value[currentHighlightedIndex + 1].id;
		}
	}
}

const highlightedItemId = ref(null);

watch(highlightedItemId, () => {
	const highlightedItem = dropdownViewport.value?.querySelector(`[data-project-id="${highlightedItemId.value}"]`);
	if (highlightedItem) {
		highlightedItem.scrollIntoView({
			block: 'nearest',
			inline: 'nearest',
		});
	} else {
		const highlightedTask = dropdownViewport.value?.querySelector(`[data-task-id="${highlightedItemId.value}"]`);
		if (highlightedTask) {
			highlightedTask.scrollIntoView({
				block: 'nearest',
				inline: 'nearest',
			});
		}
	}
});

function expandProject() {
	const currentHighlightedIndex = filteredProjects.value.findIndex(
		(projectWithTasks) => projectWithTasks.id === highlightedItemId.value
	);
	if (currentHighlightedIndex === -1) {
		return;
	}
	const currentProject = filteredProjects.value[currentHighlightedIndex];
	currentProject.expanded = true;
}

function collapseProject() {
	const currentHighlightedIndex = filteredProjects.value.findIndex(
		(projectWithTasks) => projectWithTasks.id === highlightedItemId.value
	);
	if (currentHighlightedIndex === -1) {
		return;
	}
	const currentProject = filteredProjects.value[currentHighlightedIndex];
	currentProject.expanded = false;
}

const currentProject = computed(() => {
	return props.projects.find((iteratingProject) => iteratingProject.id === project.value);
});

const currentTask = computed(() => {
	return props.tasks.find((iteratingTasks) => iteratingTasks.id === task.value);
});

const selectedProjectName = computed(() => {
	if (project.value === null) {
		return props.emptyPlaceholder;
	}
	if (project.value === '') {
		return 'No Project';
	}
	return currentProject.value?.name;
});

const selectedProjectColor = computed(() => {
	return currentProject.value?.color || 'var(--theme-color-icon-default)';
});

const mouseEnterHighlightActivated = ref(true);

function setHighlightItemId(newId) {
	if (mouseEnterHighlightActivated.value) {
		highlightedItemId.value = newId;
	}
}

function selectTask(taskId) {
	task.value = taskId;
	project.value = props.tasks.find((task) => task.id === taskId)?.project_id || null;
	open.value = false;
	searchValue.value = '';
	emit('changed', project.value, task.value);
}

function selectProject(projectId) {
	project.value = projectId;
	task.value = null;
	open.value = false;
	searchValue.value = '';
	emit('changed', project.value, task.value);
}

const showCreateProject = ref(false);
</script>

<template>
	<div v-if="projects.length === 0 && canCreateProject">
		<Badge size="large" tag="button" class="cursor-pointer hover:bg-tertiary" @click="showCreateProject = true">
			<PlusIcon class="-ml-1 w-5"></PlusIcon>
			<span>Ajouter un module</span>
		</Badge>
	</div>
	<Dropdown v-else v-model="open" :close-on-content-click="false" :align="'bottom'">
		<template #trigger>
			<ProjectBadge
				ref="projectDropdownTrigger"
				:color="selectedProjectColor"
				:size="size"
				:border="showBadgeBorder"
				tag="button"
				:name="selectedProjectName"
				:class="
					twMerge(
						'focus:border-border-tertiary w-full focus:outline-0 focus:bg-card-background-separator min-w-0 relative',
						props.class
					)
				"
			>
				<div class="flex items-center lg:space-x-1 min-w-0">
					<span class="whitespace-nowrap text-xs lg:text-sm">
						{{ selectedProjectName }}
					</span>
					<ChevronRightIcon v-if="currentTask" class="w-4 lg:w-5 text-muted shrink-0"></ChevronRightIcon>
					<div v-if="currentTask" class="min-w-0 shrink text-xs lg:text-sm truncate">
						{{ currentTask.name }}
					</div>
				</div>
				<button
					v-if="project !== null && allowReset"
					class="absolute right-0 top-0 h-full flex items-center pr-3 text-text-quaternary hover:text-text-secondary"
					@click.stop="
						project = null;
						task = null;
					"
				>
					<XMarkIcon class="w-5"></XMarkIcon>
				</button>
			</ProjectBadge>
		</template>
		<template #content>
			<UseFocusTrap v-if="open" :options="{ immediate: true, allowOutsideClick: true }">
				<input
					ref="searchInput"
					:value="searchValue"
					data-testid="client_dropdown_search"
					class="bg-card-background border-0 placeholder-muted text-sm text-text-primary py-2.5 focus:ring-0 border-b border-card-background-separator focus:border-card-background-separator w-full"
					placeholder="Search for a project or task..."
					@input="updateSearchValue"
					@keydown.enter.prevent="addClientIfNoneExists"
					@keydown.up.prevent="moveHighlightUp"
					@keydown.down.prevent="moveHighlightDown"
					@keydown.right.prevent="expandProject"
					@keydown.left.prevent="collapseProject"
				/>
				<div
					ref="dropdownViewport"
					class="min-w-[350px] max-h-[350px] overflow-y-scroll relative"
					@mousemove="mouseEnterHighlightActivated = true"
				>
					<template v-for="client in filteredResults" :key="client.id">
						<div
							v-if="client.id !== 'no_project_no_client'"
							class="w-full pb-1 pt-2 px-2 text-text-tertiary text-xs font-semibold flex space-x-1 items-center"
						>
							<span>
								{{ client.name }}
							</span>
						</div>
						<template v-for="projectWithTasks in client.projects" :key="projectWithTasks.id">
							<div
								role="option"
								class="px-1 py-0.5 cursor-default"
								:value="projectWithTasks.id"
								:data-project-id="projectWithTasks.id"
								@click="selectProject(projectWithTasks.id)"
							>
								<div
									class="rounded-lg"
									:class="{
										'bg-card-background-active': projectWithTasks.id === highlightedItemId,
									}"
								>
									<ProjectDropdownItem
										class="hover:!bg-transparent"
										:selected="isProjectSelected(projectWithTasks)"
										:name="projectWithTasks.name"
										:color="projectWithTasks.color"
										@mouseenter="setHighlightItemId(projectWithTasks.id)"
									>
										<template #actions>
											<button
												v-if="projectWithTasks.tasks.length > 0"
												tabindex="-1"
												class="px-2 py-0.5 mr-2 relative transition items-center rounded flex space-x-0.5 text-xs"
												:class="{
													'bg-white/5 text-text-secondary': projectWithTasks.expanded,
													'hover:bg-white/5 hover:text-text-secondary text-text-tertiary': !projectWithTasks.expanded,
												}"
												@click.prevent.stop="
													() => {
														projectWithTasks.expanded = !projectWithTasks.expanded;
														searchInput?.focus();
													}
												"
											>
												<span>{{ projectWithTasks.tasks.length }} Tasks</span>
												<ChevronDownIcon
													:class="{
														'transform rotate-180': projectWithTasks.expanded,
													}"
													class="w-4"
												></ChevronDownIcon>
											</button>
										</template>
									</ProjectDropdownItem>
								</div>
							</div>
							<div v-if="projectWithTasks.expanded" class="bg-quaternary">
								<div
									v-for="task in projectWithTasks.tasks"
									:key="task.id"
									:data-task-id="task.id"
									:class="{
										'bg-card-background-active': task.id === highlightedItemId,
									}"
									class="flex items-center space-x-2 w-full px-5 py-1.5 text-start text-xs font-semibold leading-5 text-text-primary focus:outline-none focus:bg-card-background-active transition duration-150 ease-in-out"
									@click="selectTask(task.id)"
									@mouseenter="setHighlightItemId(task.id)"
								>
									<MinusIcon class="w-3 h-3 text-text-quaternary"></MinusIcon>
									<span>{{ task.name }}</span>
								</div>
							</div>
						</template>
					</template>
				</div>
				<div v-if="canCreateProject" class="hover:bg-card-background-active rounded-b-lg">
					<button
						class="text-text-primary flex space-x-3 items-center px-4 py-3 text-xs font-semibold border-t border-card-background-separator"
						@click="
							open = false;
							showCreateProject = true;
						"
					>
						<PlusCircleIcon class="w-5 flex-shrink-0 text-icon-default"></PlusCircleIcon>
						<span>Create new Project</span>
					</button>
				</div>
			</UseFocusTrap>
		</template>
	</Dropdown>
	<ProjectCreateModal
		v-model:show="showCreateProject"
		:create-client
		:enable-estimated-time="enableEstimatedTime"
		:currency="currency"
		:clients="clients"
		:create-project
	></ProjectCreateModal>
</template>

<style scoped></style>
