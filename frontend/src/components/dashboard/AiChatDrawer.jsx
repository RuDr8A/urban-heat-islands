import { useState } from "react";

import { heatApi } from "../../services/api";

function cleanAIText(text) {
  if (!text) return "";

  return (
    String(text)
      // Remove markdown headings
      .replace(/^#{1,6}\s*/gm, "")

      // Remove bold / italic markdown
      .replace(/\*\*/g, "")
      .replace(/__/g, "")
      .replace(/(?<!\w)\*([^*\n]+)\*(?!\w)/g, "$1")

      // Convert markdown bullets to normal bullets
      .replace(/^\s*[-*]\s+/gm, "• ")

      // Remove markdown code markers
      .replace(/```[\w]*\n?/g, "")

      // Clean excessive blank lines
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
}

export default function AiChatDrawer({
  isOpen,
  onClose,
  city = "Raipur",
  location,
}) {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am your Urban Heat AI Analyst. I can help you understand the heat patterns, environmental indicators, machine-learning predictions, SHAP explanations, historical trends, hotspots, and urban heat risk in this project.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();

    const question = input.trim();

    if (!question || isSending) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: question,
      },
    ]);

    setInput("");

    if (!location) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Location data is still loading. Please select a location on the map and try again.",
        },
      ]);

      return;
    }

    setIsSending(true);

    try {
      const result = await heatApi.analyzeLocation({
        question,
        city,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: cleanAIText(
            result.answer ||
              "The analyst did not return an answer for this location.",
          ),
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `AI analysis failed: ${error.message}`,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 bottom-4 w-96 bg-black/60 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-[120%]"
      }`}
    >
      {/* Header */}

      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-emerald-400 text-3xl">
            psychology
          </span>

          <div>
            <h2 className="text-white font-semibold text-lg">AI Analyst</h2>

            <p className="text-white/40 text-xs mt-0.5">
              Urban Heat Intelligence
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Chat History */}

      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-50 rounded-tr-sm"
                  : "bg-white/10 border border-white/10 text-white/90 rounded-tl-sm"
              }`}
            >
              {msg.sender === "ai" ? cleanAIText(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {/* Loading message */}

        {isSending && (
          <div className="flex justify-start">
            <div className="max-w-[88%] p-4 rounded-2xl rounded-tl-sm text-sm leading-relaxed bg-white/10 border border-white/10 text-white/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[17px] animate-spin">
                  sync
                </span>

                <span>Analyzing urban heat data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}

      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about heat, ML, SHAP or trends..."
            className="w-full bg-black/40 border border-white/20 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 transition-colors shadow-inner"
          />

          <button
            type="submit"
            disabled={isSending}
            className="absolute right-2 text-emerald-400 p-2 hover:bg-white/10 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isSending ? "animate-spin" : ""
              }`}
            >
              {isSending ? "sync" : "send"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
