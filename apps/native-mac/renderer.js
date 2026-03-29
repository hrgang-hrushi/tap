if (typeof io !== 'undefined') {
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        document.getElementById('status').innerText = 'Connected to API: ' + socket.id;
        socket.emit('register_device', { device: 'macbook_pro', os: 'darwin' });
    });

    socket.on('execute', (data) => {
        if (data.action) {
            window.knockAPI.executeAction(data.action);
        }
    });

    socket.on('disconnect', () => {
        document.getElementById('status').innerText = 'Disconnected';
    });

    // Listen to devicemotion to detect physical knocks (WebKit API)
    let lastTap = 0;
    window.knockAPI.onDeviceMotion((event) => {
        if (event.acceleration && event.acceleration.z > 15) {
            const now = Date.now();
            if (now - lastTap > 300) {
                console.log('Tap detected (Z-axis spike)');
                socket.emit('knock_event', { intensity: event.acceleration.z });
                lastTap = now;
            }
        }
    });
} else {
    document.getElementById('status').innerText = 'Could not load Socket.io client. Is API running?';
}
