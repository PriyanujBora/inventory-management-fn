// Scan feedback without audio files: a short high tone for success, a low double tone for errors.
// Browsers only allow sound after a user gesture; a scanner's keystrokes count as one.

let context;

const getContext = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context ??= new AudioContext();
    if (context.state === 'suspended') context.resume();
    return context;
  } catch {
    return null;
  }
};

const tone = (audio, frequency, start, duration) => {
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
};

export const beepSuccess = () => {
  const audio = getContext();
  if (audio) tone(audio, 1320, audio.currentTime, 0.12);
};

export const beepError = () => {
  const audio = getContext();
  if (!audio) return;
  tone(audio, 220, audio.currentTime, 0.15);
  tone(audio, 220, audio.currentTime + 0.22, 0.15);
};
