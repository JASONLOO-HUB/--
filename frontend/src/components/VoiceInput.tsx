import { IconMic, IconSpinner, RecordDot } from './Icons';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceInput({ onTranscript, placeholder = '点击麦克风开始录音', className = '' }: VoiceInputProps) {
  const { isRecording, isProcessing, transcript, error, remainingTime, startRecording, stopRecording, resetTranscript } = useVoiceRecorder();

  const handleTranscript = () => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  };

  const isTimeLow = remainingTime <= 10 && remainingTime > 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isRecording
              ? 'bg-primary-700 hover:bg-primary-800'
              : 'bg-primary-600 hover:bg-primary-700'
          } ${isProcessing ? 'opacity-40 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <IconSpinner className="w-4 h-4 text-white" />
          ) : (
            <IconMic className="w-4 h-4 text-white" />
          )}
        </button>

        <div className="flex-1 text-sm">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="font-medium text-warm-800">录音中</span>
              <RecordDot active />
              <span className={`font-mono text-xs ${isTimeLow ? 'font-bold text-primary-800' : 'text-warm-400'}`}>
                {formatTime(remainingTime)}
              </span>
            </div>
          ) : isProcessing ? (
            <span className="text-warm-500">识别中…</span>
          ) : (
            <span className="text-warm-400">{placeholder}</span>
          )}
        </div>
      </div>

      {isRecording && isTimeLow && (
        <p className="text-xs text-primary-700">即将自动停止</p>
      )}

      {transcript && (
        <div className="rounded-lg border border-warm-200 bg-warm-50 p-3">
          <p className="text-sm text-warm-700">{transcript}</p>
          <button onClick={handleTranscript} className="mt-2 text-xs text-primary-600 hover:text-primary-700">
            使用此文本
          </button>
        </div>
      )}

      {error && <p className="text-xs text-primary-800">{error}</p>}
    </div>
  );
}
