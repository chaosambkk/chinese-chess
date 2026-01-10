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

// 播放移动棋子提示音（改进的音效：更清脆的"啪"声）
export function playMoveSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 创建一个更自然的移动音效：短促的"啪"声
    // 使用两个频率叠加，模拟棋子落下的声音
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 主频率：中音调
    oscillator1.frequency.value = 400;
    oscillator1.type = 'sine';
    
    // 辅助频率：高音调，增加清脆感
    oscillator2.frequency.value = 800;
    oscillator2.type = 'sine';
    
    // 设置音量包络：快速衰减，模拟短促的"啪"声
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    oscillator1.start(now);
    oscillator1.stop(now + 0.05);
    oscillator2.start(now);
    oscillator2.stop(now + 0.05);
  } catch (error) {
    console.log('无法播放移动音:', error);
  }
}

// 播放吃子提示音（语音"吃"）
export function playCaptureSound() {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance('吃');
    utterance.lang = 'zh-CN';
    utterance.rate = 1.2; // 稍快一点，更有力度
    utterance.pitch = 1.1; // 稍高一点，更清脆
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

