// 声音工具函数

// 使用 Web Speech API 播放中文语音
export function playCheckSound() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('将军');
    utterance.lang = 'zh-CN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // 尝试使用中文语音
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => 
      voice.lang.includes('zh') || voice.lang.includes('CN')
    );
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    speechSynthesis.speak(utterance);
  }
}

// 播放提示音（使用 Web Audio API 生成简单的提示音）
export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 设置音调（提示音）
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    // 设置音量包络
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('无法播放提示音:', error);
  }
}

// 播放移动棋子提示音（稍低音调）
export function playMoveSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 设置音调（移动音）
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    
    // 设置音量包络
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    console.log('无法播放移动音:', error);
  }
}

// 初始化语音（某些浏览器需要用户交互后才能使用）
export function initSpeechSynthesis() {
  if ('speechSynthesis' in window) {
    // 加载可用语音列表
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        // 语音列表已加载
      };
    }
  }
}

