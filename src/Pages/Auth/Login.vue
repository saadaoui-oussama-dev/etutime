<script setup>
import { Head, useForm, route, usePage } from '@/utils/inertia';
import AuthenticationCard from '@/Components/AuthenticationCard.vue';
import AuthenticationCardLogo from '@/Components/AuthenticationCardLogo.vue';
import InputError from '@/packages/ui/src/Input/InputError.vue';
import InputLabel from '@/packages/ui/src/Input/InputLabel.vue';
import PrimaryButton from '@/packages/ui/src/Buttons/PrimaryButton.vue';
import TextInput from '@/packages/ui/src/Input/TextInput.vue';

defineProps({
	canResetPassword: Boolean,
	status: String,
});

const form = useForm({
	email: '',
	password: '',
	remember: true,
});

const submit = () => {
	form
		.transform((data) => ({
			...data,
			remember: form.remember ? 'on' : '',
		}))
		.post(route('login'), {
			onFinish: () => form.reset('password'),
		});
};

const page = usePage();
</script>

<template>
	<!-- <Head title="Log in" /> -->

	<AuthenticationCard>
		<template #logo>
			<AuthenticationCardLogo />
		</template>

		<template #actions>
			<router-link
				class="py-8 text-muted text-sm font-medium opacity-90 hover:opacity-100 transition"
				:href="route('register')"
			>
				No account yet? <span class="text-text-primary">Register here!</span>
			</router-link>
		</template>

		<div v-if="status" class="mb-4 font-medium text-sm text-green-400">
			{{ status }}
		</div>
		<div v-if="page.props.flash?.message" class="bg-red-400 text-black text-center w-full px-3 py-1 mb-4 rounded-lg">
			{{ page.props.flash.message }}
		</div>

		<form @submit.prevent="submit">
			<div>
				<InputLabel for="email" value="Email" />
				<TextInput
					id="email"
					v-model="form.email"
					type="email"
					class="mt-1 block w-full"
					required
					autofocus
					autocomplete="username"
				/>
				<InputError class="mt-2" :message="form.errors.email" />
			</div>

			<div class="mt-4">
				<InputLabel for="password" value="Password" />
				<TextInput
					id="password"
					v-model="form.password"
					type="password"
					class="mt-1 block w-full"
					required
					autocomplete="current-password"
				/>
				<InputError class="mt-2" :message="form.errors.password" />
			</div>

			<div class="flex items-center justify-end mt-4">
				<router-link
					v-if="canResetPassword"
					:href="route('password.request')"
					class="underline text-sm text-muted hover:text-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Forgot your password?
				</router-link>

				<PrimaryButton class="ms-4" :class="{ 'opacity-25': form.processing }" :disabled="form.processing">
					Log in
				</PrimaryButton>
			</div>
		</form>
	</AuthenticationCard>
</template>
