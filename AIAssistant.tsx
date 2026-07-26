import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface AIAssistantProps {
    resume: any;
    setResume: (resume: any) => void;
    colors: any;
    initialPrompt?: string;
    isOpen?: boolean;
    onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ resume, setResume, colors, initialPrompt, isOpen: externalIsOpen, onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi! I'm your Resume AI Assistant. I can help you update your resume. Try saying 'Change my name to John' or 'Add skill React'.",
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Handle external open/prompt
    useEffect(() => {
        if (externalIsOpen) {
            setIsOpen(true);
        }
    }, [externalIsOpen]);

    useEffect(() => {
        if (initialPrompt && isOpen) {
            setInput(initialPrompt);
        }
    }, [initialPrompt, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const processCommand = (text: string) => {
        const lowerText = text.toLowerCase();
        let responseText = "I didn't understand that command. Try 'Update name to [Name]' or 'Add skill [Skill]'.";

        // Contextual Help: Summary
        if (lowerText.includes('help me write a summary')) {
            const titleMatch = text.match(/summary for a (.+)/i);
            const title = titleMatch ? titleMatch[1] : "professional";
            return `Here is a draft summary for a ${title}: "Results-oriented ${title} with a strong background in delivering high-quality solutions. Proven ability to collaborate effectively with teams and drive project success. Committed to continuous learning and professional growth."`;
        }

        // Contextual Help: Job Description
        if (lowerText.includes('help me write a description')) {
            const match = text.match(/description for (.+) at (.+)/i);
            const jobTitle = match ? match[1] : "this role";
            const company = match ? match[2] : "the company";
            return `Here are some bullet points for your ${jobTitle} role at ${company}:
• Spearheaded key initiatives that improved process efficiency by 20%.
• Collaborated with cross-functional teams to deliver projects on time and within budget.
• Mentored junior team members and fostered a culture of technical excellence.`;
        }

        // Contextual Help: Skills
        if (lowerText.includes('suggest skills')) {
            const match = text.match(/skills for a (.+) role/i);
            const role = match ? match[1].toLowerCase() : "";

            if (role.includes('software') || role.includes('developer') || role.includes('engineer')) {
                return "Suggested skills: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Git, Agile Methodologies, System Design.";
            } else if (role.includes('designer') || role.includes('ui') || role.includes('ux')) {
                return "Suggested skills: Figma, Adobe XD, Sketch, Prototyping, User Research, Wireframing, HTML/CSS, Interaction Design.";
            } else if (role.includes('manager') || role.includes('lead')) {
                return "Suggested skills: Project Management, Team Leadership, Strategic Planning, Agile/Scrum, Stakeholder Management, Communication.";
            } else {
                return "Suggested skills: Communication, Problem Solving, Teamwork, Time Management, Leadership, Adaptability.";
            }
        }

        // Update Name
        if (lowerText.includes('name to') || lowerText.includes('my name is')) {
            const name = text.replace(/.*(name to|name is)\s+/i, '').trim();
            if (name) {
                setResume({ ...resume, fullName: name });
                responseText = `Updated your name to "${name}".`;
            }
        }
        // Update Title
        else if (lowerText.includes('title to') || lowerText.includes('role to')) {
            const title = text.replace(/.*(title to|role to)\s+/i, '').trim();
            if (title) {
                setResume({ ...resume, title: title });
                responseText = `Updated your title to "${title}".`;
            }
        }
        // Update Email
        else if (lowerText.includes('email to')) {
            const email = text.replace(/.*email to\s+/i, '').trim();
            if (email) {
                setResume({ ...resume, email: email });
                responseText = `Updated your email to "${email}".`;
            }
        }
        // Add Skill
        else if (lowerText.includes('add skill') || lowerText.includes('add skills')) {
            const newSkills = text.replace(/.*add skills?\s+/i, '').split(',').map(s => s.trim()).filter(Boolean);
            if (newSkills.length > 0) {
                setResume({ ...resume, skills: [...resume.skills, ...newSkills] });
                responseText = `Added skills: ${newSkills.join(', ')}.`;
            }
        }
        // Clear Skills
        else if (lowerText.includes('clear skills') || lowerText.includes('remove all skills')) {
            setResume({ ...resume, skills: [] });
            responseText = "Cleared all skills.";
        }
        // Update Summary
        else if (lowerText.includes('summary to') || lowerText.includes('change summary')) {
            const summary = text.replace(/.*(summary to|change summary)\s+/i, '').trim();
            if (summary) {
                setResume({ ...resume, summary: summary });
                responseText = "Updated your professional summary.";
            }
        }

        return responseText;
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI processing delay
        setTimeout(() => {
            const responseText = processCommand(input);
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 600);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    const toggleOpen = () => {
        if (isOpen && onClose) {
            onClose();
        }
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={toggleOpen}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${colors.accent}, #7C2D12)`,
                    color: 'white',
                    border: 'none',
                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                    cursor: 'pointer',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'transform 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? '✕' : <Bot size={32} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '30px',
                    width: '350px',
                    height: '500px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1000,
                    overflow: 'hidden',
                    border: `1px solid ${colors.border}`,
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <style>{`
            @keyframes slideIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

                    {/* Header */}
                    <div style={{
                        padding: '16px',
                        background: `linear-gradient(135deg, ${colors.accent}, #7C2D12)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{ fontSize: '20px' }}>🤖</span>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Assistant</h3>
                            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Online</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        background: '#f8f9fa',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: '12px',
                                    background: msg.sender === 'user' ? colors.accent : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#333',
                                    boxShadow: msg.sender === 'ai' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px'
                                }}
                            >
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{
                        padding: '16px',
                        background: 'white',
                        borderTop: `1px solid ${colors.border}`,
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a command..."
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '20px',
                                border: `1px solid ${colors.border}`,
                                outline: 'none',
                                fontSize: '14px'
                            }}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: colors.accent,
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
