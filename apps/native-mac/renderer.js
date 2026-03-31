// Simplified renderer without API/Socket dependency
// Communication is now entirely via Electron IPC (window.knockAPI)

// Use native knock detection from Swift helper
if (window.knockAPI) {
    window.knockAPI.onKnock((data) => {
        console.log('Knock detected! Intensity:', data.intensity);
        // Dispatch a custom event if any other part of the app needs it locally
        window.dispatchEvent(new CustomEvent('native-knock', { detail: data.intensity }));
    });
}

// Diagnostic trigger (still useful for testing the IPC bridge)
window.addEventListener('test-knock', (e) => {
    console.log('Triggering local test knock:', e.detail);
    // Since we've removed the socket, we just dispatch it locally
    window.dispatchEvent(new CustomEvent('native-knock', { detail: e.detail }));
});

document.getElementById('status').innerText = 'System Active (Standalone Mode)';
