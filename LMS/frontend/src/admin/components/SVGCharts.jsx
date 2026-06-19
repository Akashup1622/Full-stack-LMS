import { useState } from "react"

export function RevenueLineChart({ data = [], darkMode }) {
  const [hoverIndex, setHoverIndex] = useState(null)
  
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No chart data available</div>
  }

  const height = 240
  const width = 500
  const paddingLeft = 60
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const revenues = data.map(d => d.revenue)
  const maxRevenue = Math.max(...revenues, 1000)
  const minRevenue = 0

  const getX = (index) => paddingLeft + (index / (data.length - 1)) * chartWidth
  const getY = (value) => paddingTop + chartHeight - ((value - minRevenue) / (maxRevenue - minRevenue)) * chartHeight

  // Path data calculation
  let pathD = ""
  let areaD = ""
  
  data.forEach((d, i) => {
    const x = getX(i)
    const y = getY(d.revenue)
    if (i === 0) {
      pathD = `M ${x} ${y}`
      areaD = `M ${x} ${paddingTop + chartHeight} L ${x} ${y}`
    } else {
      pathD += ` L ${x} ${y}`
      areaD += ` L ${x} ${y}`
    }
    
    if (i === data.length - 1) {
      areaD += ` L ${x} ${paddingTop + chartHeight} Z`
    }
  })

  // Horizontal Grid Lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const value = maxRevenue * ratio
    const y = getY(value)
    return { value, y }
  })

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Horizontal Grids & Y Axis labels */}
        {gridLines.map((line, idx) => (
          <g key={idx} className="opacity-40">
            <line
              x1={paddingLeft}
              y1={line.y}
              x2={width - paddingRight}
              y2={line.y}
              stroke={darkMode ? "#334155" : "#cbd5e1"}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 10}
              y={line.y + 4}
              textAnchor="end"
              className={`text-[10px] font-semibold ${darkMode ? "fill-gray-400" : "fill-gray-600"}`}
            >
              ${Math.round(line.value)}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - paddingBottom + 20}
            textAnchor="middle"
            className={`text-[10px] font-semibold ${darkMode ? "fill-gray-400" : "fill-gray-600"}`}
          >
            {d.month}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line Path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points and Tooltips */}
        {data.map((d, i) => {
          const x = getX(i)
          const y = getY(d.revenue)
          const isHovered = hoverIndex === i
          
          return (
            <g 
              key={i} 
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible interactive circle */}
              <circle cx={x} cy={y} r="14" fill="transparent" />
              
              {/* Visible dot */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "7" : "5"}
                fill={isHovered ? "#ffffff" : "#f97316"}
                stroke="#eab308"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* Tooltip Overlay */}
              {isHovered && (
                <g>
                  {/* Tooltip Card background */}
                  <rect
                    x={x - 55}
                    y={y - 45}
                    width="110"
                    height="32"
                    rx="6"
                    fill={darkMode ? "#1e293b" : "#ffffff"}
                    stroke={darkMode ? "#fbbf24" : "#f97316"}
                    strokeWidth="1"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.15))"
                  />
                  <text
                    x={x}
                    y={y - 25}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-yellow-400"
                  >
                    Rev: ${d.revenue.toLocaleString()}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function EnrollmentsBarChart({ data = [], darkMode }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No chart data available</div>
  }

  const height = 240
  const width = 500
  const paddingLeft = 50
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const enrollments = data.map(d => d.enrollments)
  const maxEnroll = Math.max(...enrollments, 10)
  
  const getX = (index) => paddingLeft + (index / data.length) * chartWidth + (chartWidth / data.length) / 2
  const getY = (value) => paddingTop + chartHeight - (value / maxEnroll) * chartHeight
  
  const barWidth = Math.min(25, (chartWidth / data.length) * 0.6)

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grids and Axes */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const value = maxEnroll * ratio
          const y = paddingTop + chartHeight - ratio * chartHeight
          return (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke={darkMode ? "#334155" : "#cbd5e1"}
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={y + 4}
                textAnchor="end"
                className={`text-[10px] font-semibold ${darkMode ? "fill-gray-400" : "fill-gray-600"}`}
              >
                {Math.round(value)}
              </text>
            </g>
          )
        })}

        {/* X Axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={height - paddingBottom + 20}
            textAnchor="middle"
            className={`text-[10px] font-semibold ${darkMode ? "fill-gray-400" : "fill-gray-600"}`}
          >
            {d.month}
          </text>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = getX(i) - barWidth / 2
          const y = getY(d.enrollments)
          const barHeight = paddingTop + chartHeight - y
          const isHovered = hoverIndex === i

          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill={isHovered ? "#fbbf24" : "url(#barGrad)"}
                className="transition-all duration-150"
              />

              {/* Bar gradient def */}
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 40}
                    y={y - 35}
                    width="80"
                    height="24"
                    rx="5"
                    fill={darkMode ? "#1e293b" : "#ffffff"}
                    stroke="#f59e0b"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 19}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-amber-500"
                  >
                    {d.enrollments} Students
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
