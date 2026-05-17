import { useMemo, useState } from "react";
import { FiCpu, FiImage, FiShield } from "react-icons/fi";
import { moderateGalleryPreview } from "../../services/api";

function getStatusTone(result) {
  if (!result) return "text-gray-400";
  return result.approved ? "text-green-400" : "text-red-400";
}

export default function VisionAIDemo() {
  const [image, setImage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeSearchRows = useMemo(() => {
    if (!result?.safeSearch) return [];

    return Object.entries(result.safeSearch);
  }, [result]);

  async function handleImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setResult(null);
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function handleModerate() {
    if (!image) return;

    try {
      setLoading(true);
      setError("");
      const data = await moderateGalleryPreview(image);
      setResult(data);
    } catch (moderationError) {
      setError(moderationError.message || "Vision AI moderation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 sm:space-y-6">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Vision AI Demo
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-500 sm:text-base">
          Upload a sample gallery image to show how Google Vision AI checks
          SafeSearch categories and visible text before admin review.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-yellow-50 text-yellow-700">
              <FiCpu />
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-gray-950">
                Moderation Flow
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Google Vision AI checks unsafe public content and visible
                profanity. Passed photos move to admin review; rejected photos
                are discarded before posting.
              </p>
            </div>
          </div>

          <label className="mt-5 grid min-h-56 cursor-pointer place-items-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center transition-colors hover:border-yellow-500 hover:bg-yellow-50">
            {image ? (
              <img src={image} alt="" className="max-h-72 rounded-lg object-contain" />
            ) : (
              <span>
                <FiImage className="mx-auto text-4xl text-gray-300" />
                <span className="mt-3 block text-sm font-bold text-gray-700">
                  Choose an image
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  PNG, JPG, or WebP sample
                </span>
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImage(event.target.files?.[0])}
              className="hidden"
            />
          </label>

          <button
            type="button"
            disabled={!image || loading}
            onClick={handleModerate}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-black text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiShield />
            {loading ? "Analyzing..." : "Run Vision AI"}
          </button>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-800 bg-[#111116] p-4 text-gray-100 shadow-sm sm:p-5">
          <div className="rounded-2xl border border-white/10 bg-[#15151b] p-4 sm:p-6">
            <h2 className="text-center text-base font-black text-gray-100">
              Moderation Result
            </h2>

            <div className="mt-6 divide-y divide-white/10">
              <ResultRow
                label="Status"
                value={result ? (result.approved ? "approved" : "rejected") : "waiting"}
                valueClassName={getStatusTone(result)}
              />
              <ResultRow
                label="Visibility"
                value={result?.visibility || "not checked"}
              />
              <ResultRow
                label="Reason"
                value={result?.reason || "Upload an image and run Vision AI."}
              />
            </div>

            <div className="mt-6 text-center">
              <p className="font-black text-gray-100">SafeSearch</p>
              <ul className="mt-3 space-y-1 text-sm font-semibold text-gray-300">
                {safeSearchRows.length > 0 ? (
                  safeSearchRows.map(([category, likelihood]) => (
                    <li key={category}>
                      {category}: {likelihood}
                    </li>
                  ))
                ) : (
                  <>
                    <li>Adult: waiting</li>
                    <li>Violence: waiting</li>
                    <li>Self-harm: waiting</li>
                    <li>Harassment: waiting</li>
                  </>
                )}
              </ul>
              {result?.profaneWords?.length > 0 && (
                <p className="mt-4 text-sm font-semibold text-red-300">
                  Profanity: {result.profaneWords.join(", ")}
                </p>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="font-black text-gray-100">
                {result?.approved ? "Approved Preview" : "Image Preview"}
              </p>
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="mx-auto mt-3 max-h-52 rounded-xl object-contain"
                />
              ) : (
                <div className="mx-auto mt-3 grid h-40 w-52 place-items-center rounded-xl bg-white/5 text-sm text-gray-500">
                  No image selected
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultRow({ label, value, valueClassName = "text-gray-100" }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[180px_minmax(0,1fr)]">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className={`text-sm font-black sm:text-right ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
