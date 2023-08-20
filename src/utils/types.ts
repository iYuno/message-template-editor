import React from "react";


export type templateType = {
  topText: string,
  conditions: IfThenElse[],
  bottomText: string
}

export type IfThenElse = {
  if: string,
  optionalThen?: string | null,
  then: string | IfThenElse[],
  optionalElse?: string | null,
  else: string | IfThenElse[],
  optionalText?: string
}

export type ConditionContextStateType = [templateType, React.Dispatch<React.SetStateAction<templateType>>]

export type ConditionContextType =
  ConditionContextStateType
  | null;

export type CurrentInputStateType = [string[], React.Dispatch<React.SetStateAction<string[]>>]

export type CurrentInputType =
  CurrentInputStateType
  | null

export type variablesType = {
  firstname: string | null,
  lastname: string | null,
  company: string | null,
  position: string | null
}
