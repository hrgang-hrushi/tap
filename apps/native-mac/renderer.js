function initSocket() {
    if (typeof io !== 'undefined') {
        const socket = io('http://localhost:3000');

        socket.on('connect', () => {
            console.log('Connected to API');
            document.getElementById('status').innerText = 'Connected to API: ' + socket.id;
            socket.emit('register_device', { device: 'macbook_pro', os: 'darwin' });
        });

        socket.on('execute', (data) => {
            if (data.action) {
                window.knockAPI.executeAction(data.action);
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from API');
            document.getElementById('status').innerText = 'Disconnected';
        });

        socket.on('request-permissions-from-electron', async () => {
            console.log('Renderer: Received request-permissions-from-electron');
            const isTrusted = await window.knockAPI.requestPermissions();
            console.log('Renderer: Permissions result:', isTrusted);
            socket.emit('permissions_status', { isTrusted });
        });

        // Listen to devicemotion to detect physical knocks (WebKit API)
        let lastTap = 0;
        window.knockAPI.onDeviceMotion((event) => {
            const acc = event.acceleration || event.accelerationIncludingGravity;
            if (acc) {
                const z = Math.abs(acc.z || 0);
                // Lower threshold for debugging and add logging
                if (z > 2) { 
                    console.log('Motion detected (Z):', z);
                }
                
                if (z > 10) { // Slightly lower than 15 for better sensitivity
                    const now = Date.now();
                    if (now - lastTap > 300) {
                        console.log('Tap detected! Intensity:', z);
                        socket.emit('knock_event', { intensity: z });
                        lastTap = now;
                    }
                }
            }
        });
        
        // Also try deviceorientation as a backup
        window.addEventListener('deviceorientation', (event) => {
            if (event.beta || event.gamma) {
                // Just log that we're getting something
                console.log('Orientation data received');
            }
        });

        // Diagnostic trigger
        window.addEventListener('test-knock', (e) => {
            console.log('Sending test knock:', e.detail);
            socket.emit('knock_event', { intensity: e.detail });
        });
    } else {
        console.error('Socket.io not found, retrying in 2s...');
        document.getElementById('status').innerText = 'Waiting for API...';
        setTimeout(() => {
            // Attempt to reload the script if it failed
            const script = document.createElement('script');
            script.src = "http://localhost:3000/socket.io/socket.io.js";
            script.onload = initSocket;
            document.head.appendChild(script);
        }, 2000);
    }
}

initSocket();
