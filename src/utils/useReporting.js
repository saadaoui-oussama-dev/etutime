import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { api } from '@/packages/api/src';
import { getCurrentOrganizationId } from '@/utils/useUser';
import { useNotificationsStore } from '@/utils/notification';
import { useProjectsStore } from '@/utils/useProjects';
import { useMembersStore } from '@/utils/useMembers';
import { useTasksStore } from '@/utils/useTasks';
import { useClientsStore } from '@/utils/useClients';
import { CheckCircleIcon, UserCircleIcon, UserGroupIcon } from '@heroicons/vue/20/solid';
import { DocumentTextIcon, FolderIcon } from '@heroicons/vue/16/solid';
import BillableIcon from '@/packages/ui/src/Icons/BillableIcon.vue';

export const useReportingStore = defineStore('reporting', () => {
	const reportingGraphResponse = ref(null);
	const reportingTableResponse = ref(null);

	const { handleApiRequestNotifications } = useNotificationsStore();

	async function fetchGraphReporting(params) {
		const organization = getCurrentOrganizationId();
		if (organization) {
			reportingGraphResponse.value = await handleApiRequestNotifications(
				() =>
					api.getAggregatedTimeEntries({
						params: {
							organization: organization,
						},
						queries: params,
					}),
				undefined,
				'Failed to fetch reporting data'
			);
		}
	}

	async function fetchTableReporting(params) {
		const organization = getCurrentOrganizationId();
		if (organization) {
			reportingTableResponse.value = await handleApiRequestNotifications(
				() =>
					api.getAggregatedTimeEntries({
						params: {
							organization: organization,
						},
						queries: params,
					}),
				undefined,
				'Failed to fetch reporting data'
			);
		}
	}

	const aggregatedGraphTimeEntries = computed(() => {
		return reportingGraphResponse.value?.data;
	});

	const aggregatedTableTimeEntries = computed(() => {
		return reportingTableResponse.value?.data;
	});

	const emptyPlaceholder = {
		user: 'No User',
		project: 'No Project',
		task: 'No Task',
		billable: 'Non-Billable',
		client: 'No Client',
		description: 'No Description',
	};

	function getNameForReportingRowEntry(key, type) {
		if (type === null) {
			return null;
		}
		if (key === null) {
			return emptyPlaceholder[type];
		}

		if (type === 'project') {
			const projectsStore = useProjectsStore();
			const { projects } = storeToRefs(projectsStore);
			return projects.value.find((project) => project.id === key)?.name;
		}
		if (type === 'user') {
			const memberStore = useMembersStore();
			const { members } = storeToRefs(memberStore);
			return members.value.find((member) => member.user_id === key)?.name;
		}
		if (type === 'task') {
			const taskStore = useTasksStore();
			const { tasks } = storeToRefs(taskStore);
			return tasks.value.find((task) => task.id === key)?.name;
		}
		if (type === 'client') {
			const clientsStore = useClientsStore();
			const { clients } = storeToRefs(clientsStore);
			return clients.value.find((client) => client.id === key)?.name;
		}
		if (type === 'billable') {
			if (key === '0') {
				return 'Non-Billable';
			} else {
				return 'Billable';
			}
		}
		return key;
	}

	const groupByOptions = [
		{
			label: 'Members',
			value: 'user',
			icon: UserGroupIcon,
		},
		{
			label: 'Projects',
			value: 'project',
			icon: FolderIcon,
		},
		{
			label: 'Tasks',
			value: 'task',
			icon: CheckCircleIcon,
		},
		{
			label: 'Clients',
			value: 'client',
			icon: UserCircleIcon,
		},
		{
			label: 'Billable',
			value: 'billable',
			icon: BillableIcon,
		},
		{
			label: 'Description',
			value: 'description',
			icon: DocumentTextIcon,
		},
	];

	return {
		aggregatedGraphTimeEntries,
		fetchGraphReporting,
		fetchTableReporting,
		aggregatedTableTimeEntries,
		getNameForReportingRowEntry,
		groupByOptions,
		emptyPlaceholder,
	};
});
