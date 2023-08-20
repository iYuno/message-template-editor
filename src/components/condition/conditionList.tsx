import React, {FC, memo, useContext, useEffect, useState} from "react";
import {v4 as uuid4} from "uuid";
import Condition from "./index";
import TextArea from "../textArea";
import {ConditionContext, da} from "../../contexts/conditionContext";
import {ConditionContextStateType, CurrentInputStateType, IfThenElse} from "../../utils/types";
import {CurrentInputContext} from "../../contexts/currentInputContext";
import s from './condition.module.css'

const ConditionList: FC = () => {

  // const template = localStorage.conditions ? JSON.parse(localStorage.conditions) as IfThenElse[] : null
  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType
  const [currentInput] = useContext(CurrentInputContext) as CurrentInputStateType

  return(
    <>
      <div className={s.textContainer}>
        <TextArea value={data.topText} isRequired={false} isCondition={true} path={['top']}/>
      </div>
      {
        data.conditions.length > 0 && data.conditions.map((d, index) => (
          <React.Fragment key={uuid4()}>
            <Condition newCondition={d} path={[`${index}`]}/>
            {
              data.conditions.length > 1 && index < data.conditions.length - 1 &&
                <div style={{marginTop: '1.5rem'}}>
                    <TextArea
                        value={d.optionalText ? d.optionalText : ''}
                        isRequired={false}
                        isCondition={false}
                        path={[`${index}`, 'optionalText']}/>
                </div>
            }
          </React.Fragment>
        ))
      }
      <div className={s.textContainer}>
        <TextArea value={data.bottomText} isRequired={false} isCondition={false} path={['bottom']}/>
      </div>
    </>
  )
}

export default ConditionList
