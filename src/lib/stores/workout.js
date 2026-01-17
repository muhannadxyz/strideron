/**
 * Workout Store - Track exercises, sets, weights, and reps
 * 
 * Placeholder store for workout tracking.
 * Replace with real database integration later.
 */

import { writable, derived } from 'svelte/store';

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

/** @type {import('svelte/store').Writable<Workout | null>} */
export const currentWorkout = writable(null);

/** @type {import('svelte/store').Writable<Workout[]>} */
export const workoutHistory = writable([]);

// Derived store for workout duration
export const workoutDuration = derived(currentWorkout, ($workout) => {
	if (!$workout) return 0;
	const now = Date.now();
	return Math.floor((now - $workout.startTime) / 1000);
});

// Check if a workout is active
export const isWorkoutActive = derived(currentWorkout, ($workout) => $workout !== null);

/**
 * Start a new workout
 */
export function startWorkout() {
	currentWorkout.set({
		id: `workout-${Date.now()}`,
		date: new Date().toISOString(),
		startTime: Date.now(),
		endTime: null,
		notes: '',
		exercises: []
	});
}

/**
 * End the current workout
 */
export function endWorkout() {
	currentWorkout.update((workout) => {
		if (!workout) return null;
		
		const completedWorkout = {
			...workout,
			endTime: Date.now()
		};
		
		// Add to history
		workoutHistory.update((history) => [completedWorkout, ...history]);
		
		return null;
	});
}

/**
 * Add an exercise to the current workout
 * @param {string} name
 */
export function addExercise(name) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		
		const newExercise = {
			id: `exercise-${Date.now()}`,
			name,
			sets: [
				{ id: 1, weight: 0, reps: 0, completed: false, previousWeight: null, previousReps: null }
			]
		};
		
		return {
			...workout,
			exercises: [...workout.exercises, newExercise]
		};
	});
}

/**
 * Remove an exercise from the current workout
 * @param {string} exerciseId
 */
export function removeExercise(exerciseId) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		
		return {
			...workout,
			exercises: workout.exercises.filter((e) => e.id !== exerciseId)
		};
	});
}

/**
 * Add a set to an exercise
 * @param {string} exerciseId
 */
export function addSet(exerciseId) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		
		return {
			...workout,
			exercises: workout.exercises.map((exercise) => {
				if (exercise.id !== exerciseId) return exercise;
				
				const lastSet = exercise.sets[exercise.sets.length - 1];
				const newSet = {
					id: exercise.sets.length + 1,
					weight: lastSet?.weight || 0,
					reps: lastSet?.reps || 0,
					completed: false,
					previousWeight: null,
					previousReps: null
				};
				
				return {
					...exercise,
					sets: [...exercise.sets, newSet]
				};
			})
		};
	});
}

/**
 * Update a set
 * @param {string} exerciseId
 * @param {number} setId
 * @param {Partial<Set>} updates
 */
export function updateSet(exerciseId, setId, updates) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		
		return {
			...workout,
			exercises: workout.exercises.map((exercise) => {
				if (exercise.id !== exerciseId) return exercise;
				
				return {
					...exercise,
					sets: exercise.sets.map((set) => {
						if (set.id !== setId) return set;
						return { ...set, ...updates };
					})
				};
			})
		};
	});
}

/**
 * Toggle set completion
 * @param {string} exerciseId
 * @param {number} setId
 */
export function toggleSetComplete(exerciseId, setId) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		
		return {
			...workout,
			exercises: workout.exercises.map((exercise) => {
				if (exercise.id !== exerciseId) return exercise;
				
				return {
					...exercise,
					sets: exercise.sets.map((set) => {
						if (set.id !== setId) return set;
						return { ...set, completed: !set.completed };
					})
				};
			})
		};
	});
}

/**
 * Update workout notes
 * @param {string} notes
 */
export function updateNotes(notes) {
	currentWorkout.update((workout) => {
		if (!workout) return workout;
		return { ...workout, notes };
	});
}
