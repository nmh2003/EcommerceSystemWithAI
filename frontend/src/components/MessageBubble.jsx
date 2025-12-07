import React from "react";

const MessageBubble = ({ message, isUser, timestamp, isTyping = false }) => {

  const parseMarkdown = (text) => {
    if (!text) return "";

    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {

      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2);
        return (
          <strong key={index} className="font-semibold">
            {boldText}
          </strong>
        );
      }

      else if (part.startsWith("*") && part.endsWith("*")) {
        const italicText = part.slice(1, -1);
        return (
          <em key={index} className="italic">
            {italicText}
          </em>
        );
      }

      else {
        return part;
      }
    });
  };

  const renderMessage = (text) => {
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return <br key={lineIndex} />;
      }

      if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("* ")) {
        return (
          <div key={lineIndex} className="flex items-start mb-1">
            <span className="text-xs mr-2 mt-1">•</span>
            <span>{parseMarkdown(trimmedLine.substring(2))}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(trimmedLine)) {
        const match = trimmedLine.match(/^(\d+\.\s)(.*)/);
        if (match) {
          return (
            <div key={lineIndex} className="flex items-start mb-1">
              <span className="text-xs mr-2 mt-1 font-medium">{match[1]}</span>
              <span>{parseMarkdown(match[2])}</span>
            </div>
          );
        }
      }

      const headerEmojis = [
        "🏨",
        "📍",
        "📝",
        "⭐",
        "📅",
        "💰",
        "🛏️",
        "📊",
        "🎯",
        "🚪",
        "❌",
        "💡",
      ];
      if (
        headerEmojis.some((emoji) => trimmedLine.startsWith(emoji)) ||
        (trimmedLine.includes(":") && trimmedLine.split(":")[0].length < 20)
      ) {
        return (
          <div key={lineIndex} className="mb-2">
            <span className="leading-relaxed">
              {parseMarkdown(trimmedLine)}
            </span>
          </div>
        );
      }

      if (trimmedLine === "---" || trimmedLine === "===") {
        return (
          <div
            key={lineIndex}
            className={`border-t my-3 ${
              isUser ? "border-blue-300" : "border-gray-300"
            }`}
          ></div>
        );
      }

      return (
        <div key={lineIndex} className="mb-2 leading-relaxed">
          {parseMarkdown(trimmedLine)}
        </div>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`flex ${
          isUser ? "flex-row-reverse" : "flex-row"
        } items-end max-w-3xl`}
      >

        <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? "bg-blue-500" : "bg-gray-500"
            }`}
          >
            {isUser ? (
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            )}
          </div>
        </div>

        <div
          className={`relative px-4 py-3 rounded-2xl max-w-lg ${
            isUser
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-800 border border-gray-200"
          }`}
        >
          {isTyping ? (
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
            </div>
          ) : (
            <div className="break-words text-base leading-relaxed">
              {renderMessage(message)}
            </div>
          )}

          {timestamp && !isTyping && (
            <div
              className={`text-xs mt-2 ${
                isUser ? "text-blue-100" : "text-gray-500"
              }`}
            >
              {new Date(timestamp).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          <div
            className={`absolute bottom-0 ${
              isUser ? "right-0 translate-x-1" : "left-0 -translate-x-1"
            }`}
          >
            <div
              className={`w-3 h-3 transform rotate-45 ${
                isUser
                  ? "bg-blue-500"
                  : "bg-gray-100 border-r border-b border-gray-200"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
