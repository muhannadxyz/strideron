<script>
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { user, isAuthenticated, logout } from '$lib/stores/auth.js';
	import WorkoutTracker from '$lib/components/WorkoutTracker.svelte';

	/**
	 * @typedef {Object} User
	 * @property {string} id
	 * @property {string} email
	 * @property {string} username
	 * @property {string} createdAt
	 */

	/** @type {User | null} */
	let currentUser = $state(null);
	let checking = $state(true);

	const unsubscribe = user.subscribe((value) => {
		currentUser = value;
	});

	onMount(() => {
		const unsubAuth = isAuthenticated.subscribe((authenticated) => {
			checking = false;
			if (!authenticated) {
				goto('/login');
			}
		});

		return () => {
			unsubscribe();
			unsubAuth();
		};
	});

	function handleLogout() {
		logout();
		goto('/login');
	}
</script>

<svelte:head>
	<title>Dashboard | Strideron</title>
</svelte:head>

{#if checking}
	<div class="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50 to-slate-100">
		<div class="text-center">
			<svg
				class="mx-auto h-8 w-8 animate-spin text-indigo-600"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			<p class="mt-4 text-sm text-slate-600">Loading...</p>
		</div>
	</div>
{:else if currentUser}
	<div class="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-slate-100">
		<header class="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<a href="/" class="text-xl font-bold text-indigo-600">Strideron</a>
				<div class="flex items-center gap-4">
					<span class="text-sm font-medium text-slate-700">@{currentUser.username}</span>
					<button
						onclick={handleLogout}
						class="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
					>
						Sign out
					</button>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="rounded-2xl bg-white/80 p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur-sm">
				<div class="flex items-center gap-4">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white">
						{currentUser.username?.charAt(0).toUpperCase() || 'U'}
					</div>
					<div>
						<h1 class="text-2xl font-bold text-slate-900">Welcome back, {currentUser.username}!</h1>
						<p class="text-slate-600">Ready to climb the ranks?</p>
					</div>
				</div>

				<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					<div class="rounded-xl bg-linear-to-br from-indigo-500 to-indigo-600 p-6 text-white">
						<p class="text-sm font-medium text-indigo-100">Current Rank</p>
						<p class="mt-2 text-3xl font-bold">--</p>
						<p class="mt-1 text-sm text-indigo-200">Season hasn't started</p>
					</div>

					<div class="rounded-xl bg-linear-to-br from-violet-500 to-purple-600 p-6 text-white">
						<p class="text-sm font-medium text-violet-100">Total Steps</p>
						<p class="mt-2 text-3xl font-bold">--</p>
						<p class="mt-1 text-sm text-violet-200">Connect your tracker</p>
					</div>

					<div class="rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white">
						<p class="text-sm font-medium text-emerald-100">Strength Score</p>
						<p class="mt-2 text-3xl font-bold">--</p>
						<p class="mt-1 text-sm text-emerald-200">Log your first workout</p>
					</div>
				</div>
			</div>

			<!-- Workout Tracker -->
			<div class="mt-8">
				<h2 class="mb-4 text-xl font-bold text-slate-900">Workout</h2>
				<WorkoutTracker />
			</div>

			<div class="mt-6 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/50">
				<div class="flex">
					<div class="shrink-0">
						<svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<p class="text-sm text-amber-700">
							<span class="font-medium">Development Mode:</span> You're viewing a placeholder dashboard. Authentication is simulated.
						</p>
					</div>
				</div>
			</div>
		</main>
	</div>
{/if}
