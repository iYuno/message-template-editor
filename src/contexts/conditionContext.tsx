import React, {createContext, PropsWithChildren, useEffect, useMemo, useState} from "react";
import {ConditionContextStateType, ConditionContextType, IfThenElse, templateType} from "../utils/types";

export const da: IfThenElse[] = [

  {
    if: '',
    optionalThen: '',
    then: [
      {
        if: '',
        optionalThen: null,
        then: '',
        optionalElse: null,
        else: '',
        optionalText: ''
      },
    ],
    optionalElse: null,
    else: '',
    optionalText: ''
  },

]

export const ConditionContext = createContext<ConditionContextType>(null)

const ConditionContextProvider = ({children} : PropsWithChildren) => {

  const [data, setData] = useState<templateType>({topText: '', conditions: [], bottomText: ''})

  return(
   <ConditionContext.Provider value={[data, setData]}>
     {children}
   </ConditionContext.Provider>
  )
}

export default ConditionContextProvider
