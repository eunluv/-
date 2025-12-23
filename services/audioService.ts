
class AudioService {
  private ctx: AudioContext | null = null;
  private lastTickWasHigh = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Synthesizes a mechanical clock sound using filtered white noise and oscillators.
   */
  public async playTick(volume: number = 0.5, isLastTen: boolean = false) {
    this.init();
    if (!this.ctx || volume <= 0) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const isTick = !this.lastTickWasHigh;
    
    // Create a mechanical "clink" using noise and an oscillator
    const duration = 0.03;
    const gain = this.ctx.createGain();
    
    // 1. Oscillator for the "ping"
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    // Tick is higher, Tock is lower
    const baseFreq = isTick ? 1200 : 900;
    const freq = isLastTen ? baseFreq * 1.3 : baseFreq;
    
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + duration);
    
    oscGain.gain.setValueAtTime(volume * 0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    // 2. Filtered noise for the "mechanical click"
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(isTick ? 3000 : 2000, now);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(volume * 0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Connect everything
    osc.connect(oscGain);
    oscGain.connect(gain);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gain);
    
    gain.connect(this.ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + duration);
    noise.stop(now + duration);

    this.lastTickWasHigh = !this.lastTickWasHigh;
  }

  public async playAlarm(volume: number = 0.5) {
    this.init();
    if (!this.ctx || volume <= 0) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    const playBeep = (time: number, freq: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(volume * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(time);
      osc.stop(time + dur);
    };

    const now = this.ctx.currentTime;
    for(let i=0; i<3; i++) {
        playBeep(now + (i * 0.2), 880, 0.4);
    }
    playBeep(now + 0.6, 1760, 1.5);
  }
}

export const audioService = new AudioService();
