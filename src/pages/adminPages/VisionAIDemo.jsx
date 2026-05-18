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

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

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
    <div className="mx-auto max-w-[1500px] space-y-4">
      <div>
        <h1 className="font-playfair text-2xl font-bold text-gray-950 sm:text-3xl">
          Vision AI Demo
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-5 text-gray-500 sm:text-base">
          Upload a sample gallery image to show how Google Vision AI checks
          SafeSearch categories and visible text before admin review.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3 border-b border-gray-100 pb-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-yellow-50 text-yellow-700">
              <FiCpu />
            </div>
            <div>
              <h2 className="font-playfair text-lg font-bold text-gray-950">
                Moderation Flow
              </h2>
              <p className="mt-1 text-xs leading-5 text-gray-600">
                Google Vision AI checks unsafe public content and visible
                profanity. Passed photos move to admin review; rejected photos
                are discarded before posting.
              </p>
            </div>
          </div>

          <label className="mt-4 grid h-80 cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center transition-colors hover:border-yellow-500 hover:bg-yellow-50">
            {image ? (
              <img src={image} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
            ) : (
              <span>
                <FiImage className="mx-auto text-3xl text-gray-300" />
                <span className="mt-2 block text-sm font-bold text-gray-700">
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
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-black px-4 text-sm font-black text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiShield />
            {loading ? "Analyzing..." : "Run Vision AI"}
          </button>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-gray-800 bg-[#111116] p-4 text-gray-100 shadow-sm">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="rounded-xl border border-white/10 bg-[#15151b] p-4">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <h2 className="text-base font-black text-gray-100">
                  Moderation Result
                </h2>
                <span
                  className={`rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest ${getStatusTone(result)}`}
                >
                  {result ? (result.approved ? "approved" : "rejected") : "waiting"}
                </span>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <ResultTile
                  label="Status"
                  value={result ? (result.approved ? "approved" : "rejected") : "waiting"}
                  valueClassName={getStatusTone(result)}
                />
                <ResultTile
                  label="Visibility"
                  value={result?.visibility || "not checked"}
                />
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Reason
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-gray-100">
                  {result?.reason || "Upload an image and run Vision AI."}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  SafeSearch
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(safeSearchRows.length > 0
                    ? safeSearchRows
                    : [
                        ["adult", "waiting"],
                        ["violence", "waiting"],
                        ["medical", "waiting"],
                        ["spoof", "waiting"],
                        ["racy", "waiting"],
                      ]
                  ).map(([category, likelihood]) => (
                    <div
                      key={category}
                      className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {category}
                      </p>
                      <p className="mt-1 truncate text-xs font-black text-gray-200">
                        {likelihood}
                      </p>
                    </div>
                  ))}
                </div>
                {result?.profaneWords?.length > 0 && (
                  <p className="mt-3 rounded-lg border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200">
                    Profanity: {result.profaneWords.join(", ")}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#15151b] p-4">
              <p className="text-center text-sm font-black text-gray-100">
                {result?.approved ? "Approved Preview" : "Image Preview"}
              </p>
              <div className="mt-3 grid h-[26rem] place-items-center overflow-hidden rounded-xl bg-black/30 p-3">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    className="max-h-full max-w-full rounded-lg object-contain"
                  />
                ) : (
                  <span className="text-sm text-gray-500">No image selected</span>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ResultTile({ label, value, valueClassName = "text-gray-100" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </p>
      <p className={`mt-1 truncate text-sm font-black ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
