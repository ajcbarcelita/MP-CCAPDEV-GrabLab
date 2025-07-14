import { ref } from 'vue'

export function useValidation() {
  const error = ref(null)
  const showErrorPopup = ref(false)

  const clearError = () => {
    error.value = null
    showErrorPopup.value = false
  }

  const setError = (message) => {
    error.value = message
    showErrorPopup.value = true
  }

  // Validate numeric input - returns true if valid, false if invalid
  const validateNumericValue = (value, options = {}) => {
    const { min = 0, allowEmpty = false } = options

    if (allowEmpty && (value === '' || value === null || value === undefined)) {
      return true
    }

    const numValue = typeof value === 'number' ? value : parseInt(String(value), 10)

    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return false
    }

    if (numValue <= min) {
      setError(`Value must be greater than ${min}`)
      return false
    }

    return true
  }

  // Prevent invalid characters in numeric input fields
  const validateNumberKeypress = (event) => {
    // Prevent 'e', '+', '-', and '.' characters
    const invalidChars = ['e', '+', '-', '.']
    if (invalidChars.includes(event.key)) {
      event.preventDefault()
    }
  }

  // Validate email format
  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  // Validate text input with minimum length
  const validateText = (text, options = {}) => {
    const { minLength = 1, field = 'Field' } = options

    if (!text || text.trim().length < minLength) {
      setError(`${field} must be at least ${minLength} characters`)
      return false
    }

    return true
  }

  // Validate password strength
  const validatePassword = (password, options = {}) => {
    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecial = false
    } = options

    if (!password || password.length < minLength) {
      setError(`Password must be at least ${minLength} characters`)
      return false
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter')
      return false
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter')
      return false
    }

    if (requireNumbers && !/\d/.test(password)) {
      setError('Password must contain at least one number')
      return false
    }

    if (requireSpecial && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      setError('Password must contain at least one special character')
      return false
    }

    return true
  }

  // Validate that two fields match (e.g., password confirmation)
  const validateFieldsMatch = (field1, field2, fieldName = 'Fields') => {
    if (field1 !== field2) {
      setError(`${fieldName} do not match`)
      return false
    }
    return true
  }

  return {
    error,
    showErrorPopup,
    clearError,
    setError,
    validateNumericValue,
    validateNumberKeypress,
    validateEmail,
    validateText,
    validatePassword,
    validateFieldsMatch
  }
}
