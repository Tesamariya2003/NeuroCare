import parselmouth
import numpy as np

# 🔥 EXACT UCI FEATURE ORDER (22 features)
FEATURE_ORDER = [
    "MDVP:Fo(Hz)",
    "MDVP:Fhi(Hz)",
    "MDVP:Flo(Hz)",
    "MDVP:Jitter(%)",
    "MDVP:Jitter(Abs)",
    "MDVP:RAP",
    "MDVP:PPQ",
    "Jitter:DDP",
    "MDVP:Shimmer",
    "MDVP:Shimmer(dB)",
    "Shimmer:APQ3",
    "Shimmer:APQ5",
    "MDVP:APQ",
    "Shimmer:DDA",
    "NHR",
    "HNR",
    "RPDE",
    "DFA",
    "spread1",
    "spread2",
    "D2",
    "PPE"
]


def extract_praat_features(audio_path):

    try:

        sound = parselmouth.Sound(audio_path)


        # 🔧 Better pitch detection settings
        pitch = sound.to_pitch(
            time_step=0.01,
            pitch_floor=50,
            pitch_ceiling=500
        )

        pitch_values = pitch.selected_array['frequency']
        pitch_values = pitch_values[pitch_values > 0]

        print("Pitch frames detected:", len(pitch_values))

        # 🔧 Reduced threshold (browser recordings often shorter)
        if len(pitch_values) < 10:
            print("Too few pitch values")
            return None

        fo_mean = np.mean(pitch_values)
        fo_max = np.max(pitch_values)
        fo_min = np.min(pitch_values)

        # ---------- Point Process ----------
        point_process = parselmouth.praat.call(
            sound, "To PointProcess (periodic, cc)", 75, 500
        )

        # ---------- Jitter ----------
        jitter_local = parselmouth.praat.call(
            point_process, "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3
        )

        jitter_abs = parselmouth.praat.call(
            point_process, "Get jitter (local, absolute)", 0, 0, 0.0001, 0.02, 1.3
        )

        jitter_rap = parselmouth.praat.call(
            point_process, "Get jitter (rap)", 0, 0, 0.0001, 0.02, 1.3
        )

        jitter_ppq = parselmouth.praat.call(
            point_process, "Get jitter (ppq5)", 0, 0, 0.0001, 0.02, 1.3
        )

        jitter_ddp = 3 * jitter_rap

        # ---------- Shimmer ----------
        shimmer_local = parselmouth.praat.call(
            [sound, point_process],
            "Get shimmer (local)",
            0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        shimmer_db = parselmouth.praat.call(
            [sound, point_process],
            "Get shimmer (local_dB)",
            0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        shimmer_apq3 = parselmouth.praat.call(
            [sound, point_process],
            "Get shimmer (apq3)",
            0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        shimmer_apq5 = parselmouth.praat.call(
            [sound, point_process],
            "Get shimmer (apq5)",
            0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        shimmer_apq = parselmouth.praat.call(
            [sound, point_process],
            "Get shimmer (apq11)",
            0, 0, 0.0001, 0.02, 1.3, 1.6
        )

        shimmer_dda = 3 * shimmer_apq3

        # ---------- Harmonicity ----------
        harmonicity = sound.to_harmonicity_cc()
        hnr = parselmouth.praat.call(harmonicity, "Get mean", 0, 0)

        # ---------- Derived Features ----------
        nhr = 1 / (hnr + 1e-6)
        rpde = np.std(pitch_values)
        dfa = np.mean(pitch_values)
        spread1 = fo_mean - fo_min
        spread2 = fo_max - fo_mean
        d2 = np.var(pitch_values)
        ppe = np.std(np.diff(pitch_values))

        features = {
            "MDVP:Fo(Hz)": fo_mean,
            "MDVP:Fhi(Hz)": fo_max,
            "MDVP:Flo(Hz)": fo_min,
            "MDVP:Jitter(%)": jitter_local,
            "MDVP:Jitter(Abs)": jitter_abs,
            "MDVP:RAP": jitter_rap,
            "MDVP:PPQ": jitter_ppq,
            "Jitter:DDP": jitter_ddp,
            "MDVP:Shimmer": shimmer_local,
            "MDVP:Shimmer(dB)": shimmer_db,
            "Shimmer:APQ3": shimmer_apq3,
            "Shimmer:APQ5": shimmer_apq5,
            "MDVP:APQ": shimmer_apq,
            "Shimmer:DDA": shimmer_dda,
            "NHR": nhr,
            "HNR": hnr,
            "RPDE": rpde,
            "DFA": dfa,
            "spread1": spread1,
            "spread2": spread2,
            "D2": d2,
            "PPE": ppe
        }

        return features

    except Exception as e:
        print("PRAAT ERROR:", e)
        return None


def format_to_uci(raw):
    return [float(raw[col]) for col in FEATURE_ORDER]