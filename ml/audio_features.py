import librosa
import numpy as np

def extract_audio_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, duration=3)

        # Pitch
        pitches, _ = librosa.piptrack(y=y, sr=sr)
        pitch = pitches[pitches > 0]
        pitch_mean = np.mean(pitch) if len(pitch) else 0
        pitch_std = np.std(pitch) if len(pitch) else 0

        # Energy
        rms = librosa.feature.rms(y=y)[0]
        rms_mean = np.mean(rms)
        rms_std = np.std(rms)

        # ZCR
        zcr = np.mean(librosa.feature.zero_crossing_rate(y))

        # MFCCs
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=17)
        mfcc_mean = np.mean(mfcc, axis=1)

        features = np.hstack([
            pitch_mean,
            pitch_std,
            rms_mean,
            rms_std,
            zcr,
            mfcc_mean
        ])

        # 🔒 HARD GUARANTEE
        if len(features) != 22:
            return None

        return features

    except Exception as e:
        print("Feature extraction error:", e)
        return None
