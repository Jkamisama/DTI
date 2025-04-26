// Password validation rules
const passwordRules = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
};

// Password validation function
function validatePassword(password) {
    const errors = [];
    
    if (password.length < passwordRules.minLength) {
        errors.push(`Password must be at least ${passwordRules.minLength} characters long`);
    }
    
    if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    
    if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    
    if (passwordRules.requireNumbers && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    
    if (passwordRules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character type checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    // Determine strength level
    let strengthLevel;
    if (strength <= 2) strengthLevel = 'weak';
    else if (strength <= 4) strengthLevel = 'medium';
    else if (strength <= 6) strengthLevel = 'strong';
    else strengthLevel = 'very strong';
    
    return {
        score: strength,
        level: strengthLevel
    };
}

// Password hashing function (using a simple implementation for demonstration)
// In a real application, you would use a proper hashing library like bcrypt
function hashPassword(password) {
    // This is a simple hash function for demonstration
    // In production, use a proper hashing algorithm like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

// Password verification function
function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// Export functions
export {
    validatePassword,
    checkPasswordStrength,
    hashPassword,
    verifyPassword
}; 