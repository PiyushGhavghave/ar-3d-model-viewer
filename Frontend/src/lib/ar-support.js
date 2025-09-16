// A simple utility to check for AR support
export const isArSupported = async () => {
    if (!navigator.xr) {
        return false;
    }
    try {
        const supported = await navigator.xr.isSessionSupported('immersive-ar');
        return supported;
    } catch (e) {
        return false;
    }
};