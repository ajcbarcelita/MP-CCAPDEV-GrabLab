import { ref } from 'vue'

export function useValidation() {
	// Reactive references for error handling and popup visibility
	const error = ref(null) // Stores the error message
	const showErrorPopup = ref(false) // Controls the visibility of the error popup

	// Clears the current error and hides the error popup
	const clearError = () => {
		error.value = null
		showErrorPopup.value = false
	}

	// Sets an error message and displays the error popup
	const setError = (message) => {
		error.value = message
		showErrorPopup.value = true
	}

	// Validates numeric input - returns true if valid, false if invalid
	const validateNumericValue = (value, options = {}) => {
		const { min = 0, allowEmpty = false } = options

		// Allow empty values if specified in options
		if (allowEmpty && (value === '' || value === null || value === undefined)) {
			return true
		}

		// Convert the value to a number
		const numValue = typeof value === 'number' ? value : parseInt(String(value), 10)

		// Check if the value is a valid number
		if (isNaN(numValue)) {
			setError('Please enter a valid number')
			return false
		}

		// Check if the value meets the minimum requirement
		if (numValue <= min) {
			setError(`Value must be greater than ${min}`)
			return false
		}

		return true
	}

	// Prevents invalid characters in numeric input fields
	const validateNumberKeypress = (event) => {
		// Prevent 'e', '+', '-', and '.' characters
		const invalidChars = ['e', '+', '-', '.']
		if (invalidChars.includes(event.key)) {
			event.preventDefault()
		}
	}

	// Validates email format - returns true if valid, false if invalid
	const validateEmail = (email) => {
		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailPattern.test(email)) {
			setError('Please enter a valid email address')
			return false
		}
		return true
	}

	// Validates text input with a minimum length requirement
	const validateText = (text, options = {}) => {
		const { minLength = 1, field = 'Field' } = options

		// Check if the text meets the minimum length requirement
		if (!text || text.trim().length < minLength) {
			setError(`${field} must be at least ${minLength} characters`)
			return false
		}

		return true
	}

	// Validates password strength based on specified criteria
	const validatePassword = (password, options = {}) => {
		const {
			minLength = 8,
			requireUppercase = true,
			requireLowercase = true,
			requireNumbers = true,
			requireSpecial = false,
		} = options

		// Check if the password meets the minimum length requirement
		if (!password || password.length < minLength) {
			setError(`Password must be at least ${minLength} characters`)
			return false
		}

		// Check if the password contains at least one uppercase letter
		if (requireUppercase && !/[A-Z]/.test(password)) {
			setError('Password must contain at least one uppercase letter')
			return false
		}

		// Check if the password contains at least one lowercase letter
		if (requireLowercase && !/[a-z]/.test(password)) {
			setError('Password must contain at least one lowercase letter')
			return false
		}

		// Check if the password contains at least one number
		if (requireNumbers && !/\d/.test(password)) {
			setError('Password must contain at least one number')
			return false
		}

		// Check if the password contains at least one special character
		if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
			setError('Password must contain at least one special character')
			return false
		}

		return true
	}

	// Validates that two fields match (e.g., password confirmation)
	const validateFieldsMatch = (field1, field2, fieldName = 'Fields') => {
		if (field1 !== field2) {
			setError(`${fieldName} do not match`)
			return false
		}
		return true
	}

	return {
		error, // Reactive reference for error message
		showErrorPopup, // Reactive reference for error popup visibility
		clearError, // Function to clear error state
		setError, // Function to set error state
		validateNumericValue, // Function to validate numeric input
		validateNumberKeypress, // Function to prevent invalid characters in numeric input
		validateEmail, // Function to validate email format
		validateText, // Function to validate text input with minimum length
		validatePassword, // Function to validate password strength
		validateFieldsMatch, // Function to validate matching fields
	}
}
