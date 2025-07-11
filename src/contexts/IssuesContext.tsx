import { createContext, useContext, useState, ReactNode } from 'react'
import { DataIssue } from '@/types/DataQuality'

interface IssuesContextType {
  apiResults: any[]
  setApiResults: (results: any[]) => void
  useApiData: boolean
  setUseApiData: (use: boolean) => void
  convertedIssues: DataIssue[]
  setConvertedIssues: (issues: DataIssue[]) => void
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined)

export const useIssues = () => {
  const context = useContext(IssuesContext)
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider')
  }
  return context
}

export const IssuesProvider = ({ children }: { children: ReactNode }) => {
  const [apiResults, setApiResults] = useState<any[]>([])
  const [useApiData, setUseApiData] = useState(false)
  const [convertedIssues, setConvertedIssues] = useState<DataIssue[]>([])

  return (
    <IssuesContext.Provider value={{
      apiResults,
      setApiResults,
      useApiData,
      setUseApiData,
      convertedIssues,
      setConvertedIssues
    }}>
      {children}
    </IssuesContext.Provider>
  )
}