import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Loader2,
    ChevronDown,
} from "lucide-react";

// Available AI models
const AI_MODELS = [
    { id: "auto", name: "Auto (Best Available)", provider: "auto" },
    {
        id: "gemini-2.0-flash-001",
        name: "Gemini 2.0 Flash",
        provider: "gemini",
    },
    {
        id: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Experimental",
        provider: "gemini",
    },
    {
        id: "gemini-1.5-flash-8b",
        name: "Gemini 1.5 Flash 8B",
        provider: "gemini",
    },
    {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B (Groq)",
        provider: "groq",
    },
    {
        id: "llama-3.1-70b-versatile",
        name: "Llama 3.1 70B (Groq)",
        provider: "groq",
    },
];

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState("auto");
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message to chat
        const newMessages = [
            ...messages,
            { role: "user", content: userMessage },
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.slice(-10),
                    model: selectedModel, // Send selected model
                }),
            });

            const data = await response.json();

            if (response.ok && data.response) {
                setMessages([
                    ...newMessages,
                    {
                        role: "assistant",
                        content: data.response,
                        model: data.model, // Store which model responded
                    },
                ]);
            } else {
                setMessages([
                    ...newMessages,
                    {
                        role: "assistant",
                        content:
                            data.error ||
                            "Sorry, I couldn't process your message. Please try again.",
                    },
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, there was a connection error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        setShowModelDropdown(false);
    };

    const getSelectedModelName = () => {
        const model = AI_MODELS.find((m) => m.id === selectedModel);
        return model ? model.name : "Auto";
    };

    // Use portal to render at document body level
    return createPortal(
        <>
            {/* Floating button */}
            <button
                id="chatbot-trigger"
                onClick={toggleChat}
                className={`
                    fixed bottom-6 right-6 z-50
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-purple-600 to-blue-600
                    hover:from-purple-500 hover:to-blue-500
                    shadow-lg shadow-purple-500/30
                    flex items-center justify-center
                    transition-all duration-300
                    hover:scale-110 hover:shadow-purple-500/50
                    ${
                        isOpen
                            ? "rotate-90 opacity-0 pointer-events-none"
                            : "rotate-0 opacity-100"
                    }
                `}
                aria-label="Open chat"
            >
                <MessageCircle className="w-6 h-6 text-white" />
                <span className="absolute w-full h-full rounded-full bg-purple-500 animate-ping opacity-25" />
            </button>

            {/* Chat panel */}
            <div
                className={`
                    fixed bottom-6 right-6 z-50
                    w-[400px] h-[560px]
                    bg-gray-900/95 backdrop-blur-xl
                    border border-purple-500/30
                    rounded-2xl shadow-2xl shadow-purple-500/20
                    flex flex-col overflow-hidden
                    transition-all duration-300 origin-bottom-right
                    ${
                        isOpen
                            ? "scale-100 opacity-100"
                            : "scale-0 opacity-0 pointer-events-none"
                    }
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">
                                PU Catalyst AI
                            </h3>
                            <p className="text-xs text-purple-300">
                                Career Advisor
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleChat}
                        className="w-8 h-8 rounded-full bg-gray-800/80 hover:bg-gray-700 flex items-center justify-center transition-colors"
                        aria-label="Close chat"
                    >
                        <X className="w-4 h-4 text-gray-300" />
                    </button>
                </div>

                {/* Model Selector */}
                <div className="px-4 py-2 border-b border-purple-500/20 bg-gray-900/50 relative">
                    <button
                        onClick={() => setShowModelDropdown(!showModelDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800/60 hover:bg-gray-800 border border-purple-500/20 rounded-lg text-sm text-gray-300 transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-xs text-purple-400">
                                Model:
                            </span>
                            <span className="text-white">
                                {getSelectedModelName()}
                            </span>
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                                showModelDropdown ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {/* Dropdown */}
                    {showModelDropdown && (
                        <div className="absolute left-4 right-4 top-full mt-1 bg-gray-800 border border-purple-500/30 rounded-lg shadow-xl z-10 overflow-hidden">
                            {AI_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => {
                                        setSelectedModel(model.id);
                                        setShowModelDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-purple-600/20 transition-colors flex items-center justify-between ${
                                        selectedModel === model.id
                                            ? "bg-purple-600/30 text-white"
                                            : "text-gray-300"
                                    }`}
                                >
                                    <span>{model.name}</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded ${
                                            model.provider === "gemini"
                                                ? "bg-blue-500/20 text-blue-300"
                                                : model.provider === "groq"
                                                ? "bg-green-500/20 text-green-300"
                                                : "bg-purple-500/20 text-purple-300"
                                        }`}
                                    >
                                        {model.provider}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
                    {messages.length === 0 && (
                        <div className="text-center py-8">
                            <Bot className="w-12 h-12 mx-auto text-purple-400 mb-4" />
                            <p className="text-gray-400 text-sm">
                                Hi! I'm your AI career advisor. Ask me anything
                                about career paths, skills, courses, or
                                professional growth!
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex gap-3 ${
                                message.role === "user"
                                    ? "flex-row-reverse"
                                    : ""
                            }`}
                        >
                            <div
                                className={`
                                w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center
                                ${
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                                        : "bg-gradient-to-br from-purple-600 to-blue-600"
                                }
                            `}
                            >
                                {message.role === "user" ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-white" />
                                )}
                            </div>

                            <div className="flex flex-col gap-1 max-w-[75%]">
                                <div
                                    className={`
                                    p-3 rounded-2xl text-sm leading-relaxed
                                    ${
                                        message.role === "user"
                                            ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-md"
                                            : "bg-gray-800/80 text-gray-100 rounded-tl-md border border-purple-500/20"
                                    }
                                `}
                                >
                                    <p className="whitespace-pre-wrap">
                                        {message.content}
                                    </p>
                                </div>
                                {message.model &&
                                    message.role === "assistant" && (
                                        <span className="text-xs text-gray-500 px-2">
                                            via {message.model}
                                        </span>
                                    )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-800/80 p-3 rounded-2xl rounded-tl-md border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                    <span className="text-sm text-gray-400">
                                        Thinking...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 border-t border-purple-500/20 bg-gray-900/80">
                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything..."
                            disabled={isLoading}
                            className="
                                flex-1 px-4 py-3 
                                bg-gray-800/80 border border-purple-500/30
                                rounded-xl text-white placeholder-gray-500
                                focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50
                                disabled:opacity-50
                                text-sm
                            "
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="
                                w-12 h-12 rounded-xl
                                bg-gradient-to-br from-purple-600 to-blue-600
                                hover:from-purple-500 hover:to-blue-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center
                                transition-all duration-200
                                hover:shadow-lg hover:shadow-purple-500/30
                            "
                            aria-label="Send message"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default ChatbotWidget;
