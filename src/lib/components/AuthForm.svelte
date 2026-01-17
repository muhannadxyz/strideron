<script>
	import { goto } from '$app/navigation';
	import { login, signup } from '$lib/stores/auth.js';

	/** @type {{ mode?: 'login' | 'signup' }} */
	let { mode = 'login' } = $props();

	let email = $state('');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let touched = $state({ email: false, username: false, password: false, confirmPassword: false });

	// Validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
	
	// Password requirements for signup
	/** @param {string} pw */
	const hasMinLength = (pw) => pw.length >= 8;
	/** @param {string} pw */
	const hasUppercase = (pw) => /[A-Z]/.test(pw);
	/** @param {string} pw */
	const hasLowercase = (pw) => /[a-z]/.test(pw);
	/** @param {string} pw */
	const hasNumber = (pw) => /[0-9]/.test(pw);
	/** @param {string} pw */
	const hasSpecialChar = (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw);

	let emailError = $derived(() => {
		if (mode !== 'signup') return '';
		if (!touched.email) return '';
		if (!email) return 'Email is required';
		if (!emailRegex.test(email)) return 'Please enter a valid email';
		return '';
	});

	let usernameError = $derived(() => {
		if (!touched.username) return '';
		if (!username) return 'Username is required';
		if (!usernameRegex.test(username)) return 'Username must be 3-20 characters (letters, numbers, underscores)';
		return '';
	});

	let passwordError = $derived(() => {
		if (!touched.password) return '';
		if (!password) return 'Password is required';
		
		if (mode === 'signup') {
			if (!hasMinLength(password)) return 'Password must be at least 8 characters';
			if (!hasUppercase(password)) return 'Password must contain at least one uppercase letter';
			if (!hasLowercase(password)) return 'Password must contain at least one lowercase letter';
			if (!hasNumber(password)) return 'Password must contain at least one number';
			if (!hasSpecialChar(password)) return 'Password must contain at least one special character';
		} else {
			if (password.length < 8) return 'Password must be at least 8 characters';
		}
		return '';
	});
	
	/** @param {string} pw */
	const isPasswordStrong = (pw) => {
		return hasMinLength(pw) && hasUppercase(pw) && hasLowercase(pw) && hasNumber(pw) && hasSpecialChar(pw);
	};

	let confirmPasswordError = $derived(() => {
		if (mode !== 'signup') return '';
		if (!touched.confirmPassword) return '';
		if (!confirmPassword) return 'Please confirm your password';
		if (confirmPassword !== password) return 'Passwords do not match';
		return '';
	});

	let isFormValid = $derived(() => {
		const usernameValid = username && usernameRegex.test(username);
		
		if (mode === 'signup') {
			const emailValid = email && emailRegex.test(email);
			const passwordValid = password && isPasswordStrong(password);
			return emailValid && usernameValid && passwordValid && confirmPassword === password;
		}
		const passwordValid = password && password.length >= 8;
		return usernameValid && passwordValid;
	});

	/** @param {SubmitEvent} e */
	async function handleSubmit(e) {
		e.preventDefault();
		touched = { email: true, username: true, password: true, confirmPassword: true };

		if (!isFormValid()) {
			return;
		}

		isLoading = true;
		error = '';

		try {
			const result = mode === 'login' ? await login(username, password) : await signup(email, password, username);

			if (result.success) {
				goto('/dashboard');
			} else {
				error = result.error || 'Something went wrong. Please try again.';
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
	<!-- Email Field (Signup only) -->
	{#if mode === 'signup'}
		<div>
			<label for="email" class="block text-sm font-medium text-slate-700">
				Email address
			</label>
			<div class="mt-1">
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					onfocus={() => (touched.email = true)}
					class="block w-full appearance-none rounded-lg border px-4 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
						{emailError()
						? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
						: 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'}"
					placeholder="you@example.com"
				/>
			</div>
			{#if emailError()}
				<p class="mt-2 text-sm text-red-600">{emailError()}</p>
			{/if}
		</div>
	{/if}

	<!-- Username Field -->
	<div>
		<label for="username" class="block text-sm font-medium text-slate-700">
			Username
		</label>
		<div class="mt-1">
			<input
				id="username"
				name="username"
				type="text"
				autocomplete="username"
				bind:value={username}
				onfocus={() => (touched.username = true)}
				class="block w-full appearance-none rounded-lg border px-4 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
					{usernameError()
					? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
					: 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'}"
				placeholder="your_username"
			/>
		</div>
		{#if usernameError()}
			<p class="mt-2 text-sm text-red-600">{usernameError()}</p>
		{/if}
	</div>

	<!-- Password Field -->
	<div>
		<label for="password" class="block text-sm font-medium text-slate-700">
			Password
		</label>
		<div class="mt-1">
			<input
				id="password"
				name="password"
				type="password"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
				bind:value={password}
				onfocus={() => (touched.password = true)}
				class="block w-full appearance-none rounded-lg border px-4 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
					{passwordError()
					? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
					: 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'}"
				placeholder="••••••••"
			/>
		</div>
		{#if passwordError()}
			<p class="mt-2 text-sm text-red-600">{passwordError()}</p>
		{/if}
		
		<!-- Password requirements checklist (Signup only) -->
		{#if mode === 'signup' && touched.password && password}
			<div class="mt-3 space-y-1.5">
				<p class="text-xs font-medium text-slate-500">Password requirements:</p>
				<div class="grid grid-cols-2 gap-1">
					<div class="flex items-center gap-1.5 text-xs {hasMinLength(password) ? 'text-emerald-600' : 'text-slate-400'}">
						<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
							{#if hasMinLength(password)}
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							{:else}
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							{/if}
						</svg>
						8+ characters
					</div>
					<div class="flex items-center gap-1.5 text-xs {hasUppercase(password) ? 'text-emerald-600' : 'text-slate-400'}">
						<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
							{#if hasUppercase(password)}
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							{:else}
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							{/if}
						</svg>
						Uppercase letter
					</div>
					<div class="flex items-center gap-1.5 text-xs {hasLowercase(password) ? 'text-emerald-600' : 'text-slate-400'}">
						<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
							{#if hasLowercase(password)}
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							{:else}
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							{/if}
						</svg>
						Lowercase letter
					</div>
					<div class="flex items-center gap-1.5 text-xs {hasNumber(password) ? 'text-emerald-600' : 'text-slate-400'}">
						<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
							{#if hasNumber(password)}
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							{:else}
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							{/if}
						</svg>
						Number
					</div>
					<div class="flex items-center gap-1.5 text-xs {hasSpecialChar(password) ? 'text-emerald-600' : 'text-slate-400'}">
						<svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
							{#if hasSpecialChar(password)}
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							{:else}
								<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
							{/if}
						</svg>
						Special character
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Confirm Password Field (Signup only) -->
	{#if mode === 'signup'}
		<div>
			<label for="confirmPassword" class="block text-sm font-medium text-slate-700">
				Confirm password
			</label>
			<div class="mt-1">
				<input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					autocomplete="new-password"
					bind:value={confirmPassword}
					onfocus={() => (touched.confirmPassword = true)}
					class="block w-full appearance-none rounded-lg border px-4 py-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
						{confirmPasswordError()
						? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
						: 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500'}"
					placeholder="••••••••"
				/>
			</div>
			{#if confirmPasswordError()}
				<p class="mt-2 text-sm text-red-600">{confirmPasswordError()}</p>
			{/if}
		</div>
	{/if}

	<!-- Error Message -->
	{#if error}
		<div class="rounded-lg bg-red-50 p-4">
			<div class="flex">
				<div class="shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-700">{error}</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Submit Button -->
	<button
		type="submit"
		disabled={isLoading}
		class="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
	>
		{#if isLoading}
			<svg
				class="mr-2 h-5 w-5 animate-spin text-white"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
				></circle>
				<path
					class="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>
			{mode === 'login' ? 'Signing in...' : 'Creating account...'}
		{:else}
			{mode === 'login' ? 'Sign in' : 'Create account'}
		{/if}
	</button>
</form>
