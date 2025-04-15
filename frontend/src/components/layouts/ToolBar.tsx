import React from "react"

export default function ToolBar({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="bg-background flex w-full items-center justify-between p-2 px-3">
        {children}
      </div>
    </>
  )
}
