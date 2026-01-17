/**
 * Auth Store - Placeholder authentication logic
 * 
 * This is the single swap point for real auth integration.
 * Replace the placeholder functions with your auth provider (Supabase, Auth.js, Lucia, etc.)
 */

import { writable, derived } from 'svelte/store';

// Helper to simulate network delay
/** @param {number} ms */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} createdAt
 */

// Core user state
/** @type {import('svelte/store').Writable<User | null>} */
const userStore = writable(null);

// Derived store to check if user is authenticated
export const isAuthenticated = derived(userStore, ($user) => $user !== null);

// Export user as readable
export const user = {
	subscribe: userStore.subscribe
};

/**
 * Login with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function login(username, password) {
	// Simulate network delay
	await delay(500);

	// Placeholder validation - replace with real auth
	if (!username || !password) {
		return { success: false, error: 'Username and password are required' };
	}

	// Placeholder: always succeed with mock user
	// In real auth, email would come from database lookup
	userStore.set({
		id: 'mock-user-id',
		email: `${username}@example.com`, // Mock: derive from username
		username,
		createdAt: new Date().toISOString()
	});

	return { success: true };
}

/**
 * Sign up with email, password, and username
 * @param {string} email 
 * @param {string} password 
 * @param {string} username
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signup(email, password, username) {
	// Simulate network delay
	await delay(500);

	// Placeholder validation - replace with real auth
	if (!email || !password || !username) {
		return { success: false, error: 'All fields are required' };
	}

	// Placeholder: always succeed with mock user
	userStore.set({
		id: 'mock-user-id',
		email,
		username,
		createdAt: new Date().toISOString()
	});

	return { success: true };
}

/**
 * Log out the current user
 */
export function logout() {
	userStore.set(null);
}
