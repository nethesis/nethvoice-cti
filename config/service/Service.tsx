import { useEffect, FC, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { axiosInit } from '../../config/axios'

interface ServiceProps {
  children: ReactNode
}

export const Service: FC<ServiceProps> = ({ children }) => {
  const { token } = useSelector((state: RootState) => state.authentication)

  useEffect(() => {
    // Init axios default config
    axiosInit()
  }, [token])

  return <>{children}</>
}
