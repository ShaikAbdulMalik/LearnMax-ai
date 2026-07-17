'use client'
import { useId } from 'react'

// Full logo (mark + wordmark) and compact (mark only) variants.
export default function LearnMaxLogo({ variant = 'full', className = '', title = 'LearnMax.ai' }) {
  const uid = useId().replace(/:/g, '')
  const gDeep = `deepBlueGrad_${uid}`
  const gBright = `brightBlueGrad_${uid}`
  const gLight = `lightBlueGrad_${uid}`

  const viewBox = variant === 'full' ? '0 0 800 600' : '250 100 300 260'

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className={className} role="img" aria-label={title}>
      <defs>
        <linearGradient id={gDeep} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a3663" />
          <stop offset="100%" stopColor="#041c38" />
        </linearGradient>
        <linearGradient id={gBright} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e5f9e" />
          <stop offset="100%" stopColor="#3b8ad9" />
        </linearGradient>
        <linearGradient id={gLight} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a9dec" />
          <stop offset="100%" stopColor="#8ec5fc" />
        </linearGradient>
      </defs>
      <g transform="translate(0, -20)">
        <g transform="translate(400, 220)">
          <path d="M -110,100 L -50,40 L -70,20 L -30,20 L -30,60 L -50,40 L -100,90 Z" fill={`url(#${gDeep})`} />
          <path d="M -30,20 L 70,-80 L 50,-100 L 110,-100 L 110,-40 L 90,-60 L -30,20 Z" fill={`url(#${gBright})`} />
          <path d="M 110,100 L 50,40 L 70,20 L 30,20 L 30,60 L 50,40 L 100,90 Z" fill={`url(#${gDeep})`} />
          <path d="M 30,20 L -70,-80 L -50,-100 L -110,-100 L -110,-40 L -90,-60 L 30,20 Z" fill={`url(#${gBright})`} />
          <circle cx="0" cy="-30" r="22" fill={`url(#${gDeep})`} />
          <circle cx="0" cy="-30" r="14" fill={`url(#${gLight})`} />
          <circle cx="-4" cy="-34" r="4" fill="#ffffff" opacity="0.8" />
          <path d="M -45,-55 L -20,-30 L -45,-5" stroke="#8ec5fc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
          <path d="M 45,-55 L 20,-30 L 45,-5" stroke="#8ec5fc" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7" />
          <g transform="translate(-75, -15) scale(0.7)" fill="#1e5f9e">
            <path d="M0,0 C-15,-5 -30,-5 -45,0 L-45,30 C-30,25 -15,25 0,30 Z" />
            <path d="M0,0 C15,-5 30,-5 45,0 L45,30 C30,25 15,25 0,30 Z" />
          </g>
          <g transform="translate(55, -10)" fill="#3b8ad9">
            <rect x="0" y="5" width="6" height="15" rx="2" />
            <rect x="10" y="0" width="6" height="20" rx="2" />
            <rect x="20" y="-8" width="6" height="28" rx="2" />
          </g>
          <path d="M 0,-85 Q 0,-70 15,-70 Q 0,-70 0,-55 Q 0,-70 -15,-70 Q 0,-70 0,-85 Z" fill={`url(#${gLight})`} />
        </g>
        {variant === 'full' && (
          <g>
            <text x="400" y="440" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="54" letterSpacing="3" textAnchor="middle">
              <tspan fill="#0a3663">LEARN</tspan><tspan fill="#3b8ad9">MAX</tspan><tspan fill="#8ec5fc">.AI</tspan>
            </text>
            <text x="400" y="480" fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" fontWeight="500" fontSize="16" fill="#1e5f9e" letterSpacing="6" textAnchor="middle">
              EMPOWERING INTELLIGENT LEARNING
            </text>
          </g>
        )}
      </g>
    </svg>
  )
}
