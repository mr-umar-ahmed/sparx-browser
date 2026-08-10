import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Copy, Library } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

const TypingIndicator = ({ color }: { color: string }) => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
)

interface ChatMessageProps {
  msg: { role: 'user' | 'ai'; content: string }
  isPrivacyMode: boolean
  T: any
  copyToClipboard: (text: string) => void
  handleSaveToWorkspace: (content: string) => void
}

const ChatMessage = React.memo(
  ({ msg, isPrivacyMode, T, copyToClipboard, handleSaveToWorkspace }: ChatMessageProps) => {
    return (
      <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
        {msg.role === 'ai' && (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-1 mr-2"
            style={{
              background: isPrivacyMode
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)'
            }}
          >
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        )}
        <div
          className="max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm"
          style={
            msg.role === 'user'
              ? {
                  background: T.userBubble,
                  color: '#fff',
                  borderRadius: '16px 4px 16px 16px'
                }
              : {
                  background: T.aiBubble,
                  border: `1px solid ${T.aiBubbleBorder}`,
                  color: T.text,
                  borderRadius: '4px 16px 16px 16px'
                }
          }
        >
          {msg.role === 'user' ? (
            <p className="whitespace-pre-wrap" style={{ fontSize: 13 }}>
              {msg.content}
            </p>
          ) : msg.content === '' ? (
            <TypingIndicator color={isPrivacyMode ? '#f59e0b' : '#3b82f6'} />
          ) : (
            <div style={{ fontSize: 13 }}>
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 style={{ color: T.text, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 style={{ color: T.text, fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 style={{ color: T.text, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p style={{ marginBottom: 8, lineHeight: 1.6 }}>{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'disc' }}>
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ paddingLeft: 16, marginBottom: 8, listStyle: 'decimal' }}>
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li style={{ marginBottom: 3, lineHeight: 1.5 }}>{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong style={{ color: T.text, fontWeight: 600 }}>{children}</strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      style={{
                        color: T.accent,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2
                      }}
                    >
                      {children}
                    </a>
                  ),
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeText = String(children).replace(/\n$/, '')
                    return !inline && match ? (
                      <div
                        className="relative group/code my-3 shadow-sm"
                        style={{
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: `1px solid ${T.border}`
                        }}
                      >
                        <SyntaxHighlighter
                          {...props}
                          style={vs}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            fontSize: 12,
                            fontFamily: '"DM Mono", monospace',
                            background: T.surface
                          }}
                        >
                          {codeText}
                        </SyntaxHighlighter>
                        <button
                          onClick={() => copyToClipboard(codeText)}
                          className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                          style={{
                            background: 'rgba(0,0,0,0.05)',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: 6,
                            padding: '4px 6px'
                          }}
                        >
                          <Copy className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    ) : (
                      <code
                        style={{
                          background: T.accentDim,
                          color: T.accent,
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontFamily: '"DM Mono", monospace',
                          fontSize: 12
                        }}
                      >
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {msg.content || ' '}
              </ReactMarkdown>

              {msg.content && (
                <div
                  className="flex items-center gap-3 mt-3 pt-2 border-t"
                  style={{ borderColor: T.border }}
                >
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="flex items-center gap-1.5 transition-colors hover:text-blue-500"
                    style={{ color: T.textMuted, fontSize: 11 }}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() => handleSaveToWorkspace(msg.content)}
                    className="flex items-center gap-1.5 transition-colors hover:text-blue-500"
                    style={{ color: T.textMuted, fontSize: 11 }}
                  >
                    <Library className="w-3 h-3" /> Save to Workspace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

export default ChatMessage
