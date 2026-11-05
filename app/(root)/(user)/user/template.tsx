// Re-runs the entrance animation when switching between account tabs.
export default function AccountTemplate({ children }: { children: React.ReactNode }) {
  return <div className='page-enter'>{children}</div>;
}
