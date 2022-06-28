export const isAuthenticated = (state) => {
    if (state.auth.auth.id) return true;
    return false;
};
