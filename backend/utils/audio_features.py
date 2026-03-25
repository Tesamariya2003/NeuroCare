import librosa
import numpy as np

def extract_audio_features(audio_path):
    y, sr = librosa.load(audio_path, duration=3)

    pitches, _ = librosa.piptrack(y=y, sr=sr)
    pitch_mean = np.mean(pitches[pitches > 0]) if np.any(pitches > 0) else 0

    rms = librosa.feature.rms(y=y)[0]
    rms_mean = np.mean(rms)
    rms_std = np.std(rms)

    zcr = np.mean(librosa.feature.zero_crossing_rate(y))

    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=18)  # 👈 adjust
    mfcc_mean = np.mean(mfcc, axis=1)

    features = np.hstack([
        pitch_mean,
        rms_mean,
        rms_std,
        zcr,
        mfcc_mean
    ])

    if len(features) != 22:
        return None

    return features

