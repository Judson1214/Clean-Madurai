import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getChatResponse } from '../data/appData';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are "Clean Madurai AI Assistant" 🌿 — an expert chatbot for the Clean Madurai (சுத்தமான மதுரை) civic waste management platform.

Your expertise covers:
- ♻️ Recycling: plastics, paper, glass, metals, e-waste disposal
- 🗑️ Waste segregation: wet (green bin), dry (blue bin), hazardous (red bin)
- 🌱 Composting techniques for homes and communities
- 🏙️ Madurai city waste management policies and schedules
- 💡 Creative recycling and upcycling ideas
- 🚛 Garbage collection schedules and dustbin locations in Madurai
- 📋 How to report cleanliness issues and track complaints
- 🌍 Environmental awareness and sustainability tips

Guidelines:
- Be helpful, friendly, and concise (2-4 short paragraphs max)
- Use bullet points and emojis for readability
- When relevant, mention Madurai-specific info (Madurai Corporation, local collection schedules, nearby recycling centers)
- If asked about non-waste topics, politely redirect to your area of expertise
- Support both English and Tamil queries — respond in the language the user writes in
- Format important text with **bold** markers
- End responses with a helpful follow-up suggestion`;

// Conversation history for context
let conversationHistory = [];

async function getAIResponse(userMessage) {
    if (!OPENAI_API_KEY) return null;

    conversationHistory.push({ role: 'user', content: userMessage });

    // Keep last 10 messages for context
    if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...conversationHistory,
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('OpenAI API error:', response.status, errorData);
            return null;
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content;

        if (assistantMessage) {
            conversationHistory.push({ role: 'assistant', content: assistantMessage });
            return assistantMessage;
        }

        return null;
    } catch (error) {
        console.warn('OpenAI API call failed:', error.message);
        return null;
    }
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiMode, setAiMode] = useState(!!OPENAI_API_KEY);
    const messagesEndRef = useRef(null);
    const { t } = useLanguage();

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeText = aiMode
                ? "Hello! 🌿 I'm your **AI-powered Clean Madurai Assistant** — powered by ChatGPT.\n\nAsk me anything about recycling, waste management, composting, or Madurai city cleanliness! I can answer in English or Tamil.\n\nTry the quick topics below or type your own question 👇"
                : t('chatWelcome');

            setMessages([{
                type: 'bot',
                text: welcomeText,
                quickReplies: aiMode
                    ? ['♻️ How to recycle plastic?', '🗑️ Waste segregation tips', '🌱 Home composting guide', '🔋 E-waste disposal', '🚛 Collection schedule', '💡 Upcycling ideas']
                    : ['♻️ Plastic', '📄 Paper', '🔋 E-Waste', '🌱 Composting', '🗑️ Segregation', '💡 Ideas'],
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { type: 'user', text: text.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            let responseText;

            if (aiMode) {
                // Try OpenAI API first
                responseText = await getAIResponse(text.trim());
            }

            // Fallback to local responses
            if (!responseText) {
                await new Promise(resolve => setTimeout(resolve, 500));
                responseText = getChatResponse(text);
                if (aiMode) {
                    responseText += '\n\n⚠️ *AI is temporarily unavailable. Showing cached response.*';
                }
            }

            const botMsg = {
                type: 'bot',
                text: responseText,
                quickReplies: aiMode
                    ? ['♻️ More recycling tips', '🏙️ Madurai waste info', '🌱 Composting help', '🔋 E-waste guide', '📋 How to report issues', '💡 Eco ideas']
                    : ['♻️ Plastic', '📄 Paper', '🔋 E-Waste', '🌱 Composting', '🗑️ Segregation', '💡 Ideas'],
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: '❌ Something went wrong. Please try again.',
                quickReplies: ['♻️ Plastic', '📄 Paper', '🔋 E-Waste'],
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Format text with basic markdown (bold, bullets)
    const formatText = (text) => {
        return text.split('\n').map((line, j, arr) => {
            // Handle bold **text**
            const parts = line.split(/\*\*(.*?)\*\*/g);
            const formatted = parts.map((part, k) =>
                k % 2 === 1
                    ? <strong key={k} style={{ color: 'var(--primary-light)' }}>{part}</strong>
                    : part
            );

            return (
                <span key={j}>
                    {formatted}
                    {j < arr.length - 1 && <br />}
                </span>
            );
        });
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="bot-avatar">🌿</div>
                        <div>
                            <h4>{t('chatbot')}</h4>
                            <p style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {aiMode ? (
                                    <>
                                        <span style={{
                                            width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
                                            display: 'inline-block', animation: 'pulse-badge 2s infinite',
                                        }}></span>
                                        ChatGPT Powered
                                    </>
                                ) : (
                                    '♻️ Recycling & Waste Tips'
                                )}
                            </p>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                <div className={`chat-message ${msg.type}`}>
                                    {formatText(msg.text)}
                                </div>
                                {msg.quickReplies && msg.type === 'bot' && (
                                    <div className="quick-replies">
                                        {msg.quickReplies.map((reply, j) => (
                                            <button key={j} className="quick-reply-btn" onClick={() => sendMessage(reply)}>
                                                {reply}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message typing">
                                <div className="typing-dots">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chatbot-input" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={aiMode ? 'Ask anything about waste & recycling...' : t('chatPlaceholder')}
                        />
                        <button type="submit">➤</button>
                    </form>

                    {/* AI Mode indicator */}
                    <div style={{
                        padding: '6px 12px', background: 'var(--bg-card)',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 10, color: 'var(--text-muted)',
                        borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    }}>
                        {aiMode ? (
                            <>🤖 Powered by OpenAI GPT-3.5 • Madurai Waste Expert</>
                        ) : (
                            <>💚 Offline Mode • Add VITE_OPENAI_API_KEY for AI responses</>
                        )}
                    </div>
                </div>
            )}

            <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} id="chatbot-toggle">
                {isOpen ? '✕' : '🌿'}
            </button>
        </div>
    );
}
