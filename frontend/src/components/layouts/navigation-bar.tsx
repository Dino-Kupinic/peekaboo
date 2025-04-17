import React from "react"

export default function NavigationBar({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <header className="bg-background flex w-full items-center justify-between border-b border-neutral-200 p-2 px-3 dark:border-neutral-800">
        {children}
      </header>
    </>
  )
}
