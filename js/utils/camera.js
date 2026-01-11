export async function capturePhoto() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera API is not supported by this browser');
  }
  
  try {
    console.log('[Camera] Requesting camera access...');
    
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    console.log('[Camera] Camera access granted');
    
    const photoData = await showCameraPreview(stream);
    
    stream.getTracks().forEach(track => track.stop());
    console.log('[Camera] Camera stream stopped');
    
    return photoData;
    
  } catch (error) {
    console.error('[Camera] Error accessing camera:', error);
    throw error;
  }
}

function showCameraPreview(stream) {
  return new Promise((resolve, reject) => {
    const modal = document.createElement('div');
    modal.className = 'camera-modal';
    modal.innerHTML = `
      <div class="camera-container">
        <video id="cameraPreview" autoplay playsinline></video>
        <div class="camera-controls">
          <button id="captureBtn" class="btn-primary">📷 Capture</button>
          <button id="cancelBtn" class="btn-text">Cancel</button>
        </div>
        <canvas id="photoCanvas" style="display: none;"></canvas>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const video = document.getElementById('cameraPreview');
    const canvas = document.getElementById('photoCanvas');
    const captureBtn = document.getElementById('captureBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    video.srcObject = stream;
    
    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      document.body.removeChild(modal);
      resolve(photoData);
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(null);
    });
  });
}

export async function checkCameraPermission() {
  if (!navigator.permissions) {
    return 'unsupported';
  }
  
  try {
    const result = await navigator.permissions.query({ name: 'camera' });
    console.log('[Camera] Permission status:', result.state);
    return result.state;
  } catch (error) {
    console.error('[Camera] Error checking permission:', error);
    return 'unsupported';
  }
}
