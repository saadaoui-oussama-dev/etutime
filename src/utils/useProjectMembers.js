import { defineStore } from 'pinia';
import { api } from '@/packages/api/src';
import { computed, ref } from 'vue';
import { getCurrentOrganizationId } from '@/utils/useUser';
import { useNotificationsStore } from '@/utils/notification';

export const useProjectMembersStore = defineStore('project-members', () => {
    const projectMemberResponse = ref(null);
    const { handleApiRequestNotifications } = useNotificationsStore();

    async function fetchProjectMembers(projectId) {
        const organization = getCurrentOrganizationId();
        if (organization) {
            projectMemberResponse.value = await handleApiRequestNotifications(
                () =>
                    api.getProjectMembers({
                        params: {
                            organization: organization,
                            project: projectId,
                        },
                    }),
                undefined,
                'Failed to fetch project members'
            );
        }
    }

    async function createProjectMember(projectId, projectMemberBody) {
        const organization = getCurrentOrganizationId();
        if (organization) {
            await handleApiRequestNotifications(
                () =>
                    api.createProjectMember(projectMemberBody, {
                        params: {
                            organization: organization,
                            project: projectId,
                        },
                    }),
                'Project member added successfully',
                'Failed to add project member'
            );
            await fetchProjectMembers(projectId);
        }
    }

    async function updateProjectMember(projectMemberId, projectMemberBody) {
        const organization = getCurrentOrganizationId();
        if (organization) {
            const response = await handleApiRequestNotifications(
                () =>
                    api.updateProjectMember(projectMemberBody, {
                        params: {
                            organization: organization,
                            projectMember: projectMemberId,
                        },
                    }),
                'Project member updated successfully',
                'Failed to update project member'
            );
            await fetchProjectMembers(response.data.project_id);
        }
    }

    async function deleteProjectMember(projectId, projectMemberId) {
        const organizationId = getCurrentOrganizationId();
        if (organizationId) {
            await handleApiRequestNotifications(
                () =>
                    api.deleteProjectMember(undefined, {
                        params: {
                            organization: organizationId,
                            projectMember: projectMemberId,
                        },
                    }),
                'Project member removed successfully',
                'Failed to remove project member'
            );
            await fetchProjectMembers(projectId);
        }
    }

    const projectMembers = computed(() => projectMemberResponse.value?.data || []);

    return {
        projectMembers,
        fetchProjectMembers,
        createProjectMember,
        deleteProjectMember,
        updateProjectMember,
    };
});
