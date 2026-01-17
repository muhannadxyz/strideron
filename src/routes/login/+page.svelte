<script>
	import AuthForm from '$lib/components/AuthForm.svelte';
</script>

<svelte:head>
	<title>Sign in | Strideron</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-linear-to-br from-slate-50 via-indigo-50 to-slate-100">
	<!-- Decorative background elements -->
	<div class="pointer-events-none fixed inset-0 overflow-hidden">
		<div class="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-indigo-200 opacity-30 blur-3xl"></div>
		<div class="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-200 opacity-30 blur-3xl"></div>
	</div>

	<div class="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
		<!-- Logo & Header -->
		<div class="text-center">
			<a href="/" class="inline-block">
				<h1 class="text-3xl font-bold tracking-tight text-indigo-600">Strideron</h1>
			</a>
			<h2 class="mt-6 text-2xl font-semibold text-slate-900">Welcome back</h2>
			<p class="mt-2 text-sm text-slate-600">
				Sign in to continue your journey
			</p>
		</div>

		<!-- Form Card -->
		<div class="mt-8 px-4 sm:px-0">
			<div class="rounded-2xl bg-white/80 px-6 py-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 backdrop-blur-sm sm:px-10">
				<AuthForm mode="login" />

				<!-- Divider -->
				<div class="relative mt-8">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-slate-200"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="bg-white px-4 text-slate-500">New to Strideron?</span>
					</div>
				</div>

				<!-- Sign up link -->
				<div class="mt-6 text-center">
					<a
						href="/signup"
						class="font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-500"
					>
						Create an account
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
