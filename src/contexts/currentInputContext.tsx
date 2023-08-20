import React, {createContext, PropsWithChildren, useState} from "react";
import {CurrentInputStateType, CurrentInputType} from "../utils/types";


export const CurrentInputContext = createContext<CurrentInputType>(null)

const CurrentInputContextProvider = ({children} : PropsWithChildren) => {

  const [currentInput, setCurrentInput] = useState<string[]>(['top'])

  return(
    <CurrentInputContext.Provider value={[currentInput, setCurrentInput]}>
      {children}
    </CurrentInputContext.Provider>
  )
}

export default CurrentInputContextProvider
