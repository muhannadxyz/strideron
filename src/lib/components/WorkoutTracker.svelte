<script>
	import {
		currentWorkout,
		isWorkoutActive,
		startWorkout,
		endWorkout,
		addExercise,
		removeExercise,
		addSet,
		updateSet,
		toggleSetComplete,
		updateNotes
	} from '$lib/stores/workout.js';

	/**
	 * @typedef {Object} Set
	 * @property {number} id
	 * @property {number} weight
	 * @property {number} reps
	 * @property {boolean} completed
	 * @property {number | null} previousWeight
	 * @property {number | null} previousReps
	 */

	/**
	 * @typedef {Object} Exercise
	 * @property {string} id
	 * @property {string} name
	 * @property {Set[]} sets
	 */

	/**
	 * @typedef {Object} Workout
	 * @property {string} id
	 * @property {string} date
	 * @property {number} startTime
	 * @property {number | null} endTime
	 * @property {string} notes
	 * @property {Exercise[]} exercises
	 */

	/** @type {Workout | null} */
	let workout = $state(null);
	let active = $state(false);
	let elapsedSeconds = $state(0);
	let newExerciseName = $state('');
	let showAddExercise = $state(false);

	/** @type {ReturnType<typeof setInterval> | null} */
	let timerInterval = null;

	const unsubWorkout = currentWorkout.subscribe((value) => {
		workout = value;
	});

	const unsubActive = isWorkoutActive.subscribe((value) => {
		active = value;
		
		if (value && !timerInterval) {
			timerInterval = setInterval(() => {
				if (workout) {
					elapsedSeconds = Math.floor((Date.now() - workout.startTime) / 1000);
				}
			}, 1000);
		} else if (!value && timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
			elapsedSeconds = 0;
		}
	});

	/** @param {number} totalSeconds */
	function formatTime(totalSeconds) {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}

	function handleStartWorkout() {
		startWorkout();
	}

	function handleEndWorkout() {
		if (confirm('End this workout?')) {
			endWorkout();
		}
	}

	function handleAddExercise() {
		if (newExerciseName.trim()) {
			addExercise(newExerciseName.trim());
			newExerciseName = '';
			showAddExercise = false;
		}
	}

	/**
	 * @param {string} exerciseId
	 * @param {number} setId
	 * @param {'weight' | 'reps'} field
	 * @param {Event} e
	 */
	function handleSetChange(exerciseId, setId, field, e) {
		const target = /** @type {HTMLInputElement} */ (e.target);
		const value = parseInt(target.value) || 0;
		updateSet(exerciseId, setId, { [field]: value });
	}

	const commonExercises = [
		'Bench Press',
		'Squat',
		'Deadlift',
		'Overhead Press',
		'Barbell Row',
		'Pull-ups',
		'Dumbbell Curl',
		'Tricep Extension',
		'Leg Press',
		'Lat Pulldown'
	];
</script>

{#if !active}
	<button
		onclick={handleStartWorkout}
		class="w-full rounded-xl bg-indigo-600 p-6 text-xl font-bold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-xl"
	>
		+ Start Workout
	</button>
{:else if workout}
	<div class="space-y-4">
		<!-- Timer Header -->
		<div class="rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="h-3 w-3 animate-pulse rounded-full bg-white"></div>
					<span class="font-mono text-3xl font-bold tabular-nums">
						{formatTime(elapsedSeconds)}
					</span>
				</div>
				<button
					onclick={handleEndWorkout}
					class="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
				>
					End Workout
				</button>
			</div>
			<input
				type="text"
				placeholder="Workout notes..."
				value={workout.notes}
				oninput={(e) => updateNotes(/** @type {HTMLInputElement} */(e.target).value)}
				class="mt-3 w-full border-0 border-b border-white/30 bg-transparent text-sm text-white/80 placeholder-white/50 focus:border-white focus:outline-none focus:ring-0"
			/>
		</div>

		<!-- Exercises -->
		{#each workout.exercises as exercise (exercise.id)}
			<div class="overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
				<div class="flex items-center justify-between bg-slate-50 px-4 py-3">
					<h3 class="font-semibold text-slate-900">{exercise.name}</h3>
					<div class="flex items-center gap-2">
						<button
							onclick={() => addSet(exercise.id)}
							class="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
						>
							+ Set
						</button>
						<button
							onclick={() => removeExercise(exercise.id)}
							class="rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
						>
							Remove
						</button>
					</div>
				</div>

				<div class="grid grid-cols-[50px_1fr_80px_80px_50px] gap-2 border-b border-slate-100 px-4 py-2 text-xs font-medium uppercase text-slate-500">
					<span>Set</span>
					<span>Previous</span>
					<span>lbs</span>
					<span>Reps</span>
					<span></span>
				</div>

				{#each exercise.sets as set (set.id)}
					<div 
						class="grid grid-cols-[50px_1fr_80px_80px_50px] items-center gap-2 px-4 py-3 transition-colors {set.completed ? 'bg-emerald-50' : ''}"
					>
						<span class="text-sm font-medium {set.completed ? 'text-emerald-600' : 'text-slate-700'}">
							{set.id}
						</span>
						<span class="text-sm text-slate-400">
							{set.previousWeight && set.previousReps ? `${set.previousWeight} × ${set.previousReps}` : '—'}
						</span>
						<input
							type="number"
							value={set.weight}
							oninput={(e) => handleSetChange(exercise.id, set.id, 'weight', e)}
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 {set.completed ? 'border-emerald-300 bg-emerald-50' : ''}"
							min="0"
						/>
						<input
							type="number"
							value={set.reps}
							oninput={(e) => handleSetChange(exercise.id, set.id, 'reps', e)}
							class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-center text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 {set.completed ? 'border-emerald-300 bg-emerald-50' : ''}"
							min="0"
						/>
						<button
							onclick={() => toggleSetComplete(exercise.id, set.id)}
							class="flex h-8 w-8 items-center justify-center rounded-full transition-colors {set.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 hover:border-emerald-400'}"
						>
							{#if set.completed}
								<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
								</svg>
							{/if}
						</button>
					</div>
				{/each}
			</div>
		{/each}

		<!-- Add Exercise -->
		{#if showAddExercise}
			<div class="rounded-xl bg-white p-4 shadow-md ring-1 ring-slate-200">
				<input
					type="text"
					bind:value={newExerciseName}
					placeholder="Exercise name..."
					class="mb-3 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
					onkeydown={(e) => e.key === 'Enter' && handleAddExercise()}
				/>
				<div class="mb-4 flex flex-wrap gap-2">
					{#each commonExercises as name}
						<button
							onclick={() => { newExerciseName = name; handleAddExercise(); }}
							class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700"
						>
							{name}
						</button>
					{/each}
				</div>
				<div class="flex gap-2">
					<button
						onclick={handleAddExercise}
						class="flex-1 rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-500"
					>
						Add Exercise
					</button>
					<button
						onclick={() => { showAddExercise = false; newExerciseName = ''; }}
						class="rounded-lg bg-slate-100 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200"
					>
						Cancel
					</button>
				</div>
			</div>
		{:else}
			<button
				onclick={() => showAddExercise = true}
				class="w-full rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-sm font-medium text-slate-500 transition-all hover:border-indigo-400 hover:text-indigo-600"
			>
				+ Add Exercise
			</button>
		{/if}
	</div>
{/if}
