"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
function validateRegister(body) {
    if (!body.username || typeof body.username !== 'string' || body.username.trim().length < 3) {
        return 'Username must be at least 3 characters long';
    }
    if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
        return 'Password must be at least 6 characters long';
    }
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
        return 'Name is required';
    }
    return null;
}
function validateLogin(body) {
    if (!body.username || typeof body.username !== 'string') {
        return 'Username is required';
    }
    if (!body.password || typeof body.password !== 'string') {
        return 'Password is required';
    }
    return null;
}
