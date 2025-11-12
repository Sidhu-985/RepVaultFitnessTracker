"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Themes
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
    color?: string
    theme?: Record<keyof typeof THEMES, string>
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error("useChart must be used within a <ChartContainer />")
  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          // keep the same utility rules but use full width/height instead of aspect ratio
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex w-full h-full justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        {/* make ResponsiveContainer explicit so it fills the parent height */}
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: Record<string, any> }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme || c.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, c]) => {
    const color = c.theme?.[theme as keyof typeof c.theme] || c.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent(props: any) {
  const { active, payload, className, indicator = "dot", hideLabel = false, label, labelFormatter } = props
  const { config } = useChart()

  if (!active || !payload?.length) return null

  const [item] = payload
  const key = item?.dataKey || item?.name || "value"
  const itemConfig = config[key]

  return (
    <div className={cn("border-border/50 bg-background grid min-w-[8rem] rounded-lg border px-2.5 py-1.5 text-xs shadow-xl", className)}>
      {!hideLabel && (
        <div className="font-medium">
          {labelFormatter ? labelFormatter(itemConfig?.label ?? label, payload) : itemConfig?.label ?? label}
        </div>
      )}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between text-muted-foreground">
          <span>{config[p.dataKey]?.label ?? p.name}</span>
          <span className="text-foreground font-mono">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
}: any) {
  const { config } = useChart()
  if (!payload?.length) return null

  return (
    <div className={cn("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className)}>
      {payload.map((item: any) => (
        <div key={item.value} className="flex items-center gap-1.5">
          {!hideIcon && <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: item.color }} />}
          {config[item.dataKey]?.label}
        </div>
      ))}
    </div>
  )
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
