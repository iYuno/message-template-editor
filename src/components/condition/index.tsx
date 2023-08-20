import {FC, useContext, useMemo, useState} from "react";
import TextArea from "../textArea";
import s from './condition.module.css'
import React from "react";
import { v4 as uuid4 } from 'uuid';
import {ConditionContextStateType, CurrentInputStateType, IfThenElse, templateType} from "../../utils/types";
import {ConditionContext} from "../../contexts/conditionContext";
import {CurrentInputContext} from "../../contexts/currentInputContext";

interface ICondition {
  newCondition: IfThenElse,
  tab?: boolean,
  path: string[],
}


const Condition: FC<ICondition> = ({newCondition, tab, path}) => {

  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType

  const getCondition = (key: string) => {
    switch (key) {
      case 'if':
        return <p className={s.if}>{key}</p>
      case 'then':
        return <p className={s.then}>{key}</p>
      case 'else':
        return <p className={s.else}>{key}</p>
    }
  }
  const getRow = (key: string, value: string | IfThenElse | IfThenElse[] | null, index: number) => {
    switch (`${key} ${typeof value}`) {
      // case 'optionalText string':
        // return <div className={s.option}>
        //         <span className={s.tab}/>
        //         <TextArea
        //           value={`${key} ${value}`}
        //           isRequired={false}
        //           isCondition={false}/>
        //        </div>
      case 'optionalThen string':
        return <div className={s.row}>
          {
            key !== 'optionalText' && getCondition('then')
          }
          <TextArea
            value={typeof value === 'string' ? value : ''}
            isRequired={false}
            isCondition={true}
            path={[...path, key]}
          />
        </div>
      case 'optionalElse string':
        return <div className={s.row}>
          {
            key !== 'optionalText' && getCondition('else')
          }
          <TextArea
            value={typeof value === 'string' ? value : ''}
            isRequired={false}
            isCondition={true}
            path={[...path, key]}
          />
        </div>
      case 'then object':
        return (
          !Array.isArray(value) ?
            <>
              <Condition newCondition={value as IfThenElse} path={[...path, key]} tab/>
            </> :
            value.map((value, index) => (
              <React.Fragment key={uuid4()}>
                <Condition path={[...path, key, index.toString()]} newCondition={value} tab/>
                <div className={s.option}>
                  <span className={s.tab}/>
                  <TextArea
                    value={value.optionalText ? value.optionalText : ''}
                    isRequired={false}
                    isCondition={false}
                    path={[...path, key, index.toString(), 'optionalText']}
                  />
                </div>
              </React.Fragment>
            ))
        )
      case 'else object':
        return (
          !Array.isArray(value) ?
            <>
              <Condition newCondition={value as IfThenElse} path={[...path, key]} tab/>
            </>
            :
            value.map((value, index) => (
              <React.Fragment key={uuid4()}>
                <Condition newCondition={value} path={[...path, key, index.toString()]} tab/>
                <div className={s.option}>
                  <span className={s.tab}/>
                  <TextArea
                    value={value.optionalText ? value.optionalText : ''}
                    path={[...path, key, index.toString(), 'optionalText']}
                    isRequired={false}
                    isCondition={false}/>
                </div>
              </React.Fragment>
            ))
        )
      case 'if string':
        return <div className={s.row}>
          {
            key !== 'optionalText' && getCondition(key)
          }
          <TextArea
            value={typeof value === 'string' ? value : ''}
            path={[...path, key]}
            isRequired={key === 'if'}
            isCondition={!(key === 'if' || key === 'optionalText')}/>
        </div>

      case 'then string':
        return <div className={s.row}>
          {
            key !== 'optionalText' && getCondition(key)
          }
          <TextArea
            value={typeof value === 'string' ? value : ''}
            path={[...path, key]}
            isRequired={key === 'if'}
            isCondition={!(key === 'if' || key === 'optionalText')}/>
        </div>
      case 'else string':
        return <div className={s.row}>
          {
            key !== 'optionalText' && getCondition(key)
          }
          <TextArea
            value={typeof value === 'string' ? value : ''}
            path={[...path, key]}
            isRequired={key === 'if'}
            isCondition={!(key === 'if' || key === 'optionalText')}/>
        </div>
    }
  }

  const deleteCondition = (newPath: string[], condition: IfThenElse) => {
    if(newPath.length - 2) {
      Object.entries(condition).forEach(([key, value], index) => {
        if(key === newPath[0]) {
          switch (typeof value) {
            case 'string':
              break
            case 'object':
              if(Array.isArray(value)) {
                deleteCondition(newPath.slice(2), value[+newPath[1]])
              } else if(value) {
                deleteCondition(newPath.slice(1), value)
              }
          }
        }
      })
    } else {
      switch (newPath[0]) {
        case 'then':
          if(Array.isArray(condition.then) && condition.then.length > 1) {
            condition.then.splice(+newPath[1], 1)
          } else if(Array.isArray(condition.then)) {
            condition.then = '';
            condition.optionalThen = null
          }
          break
        case 'else':
          if(Array.isArray(condition.else) && condition.else.length > 1) {
            condition.else.splice(+newPath[1], 1)
          } else if(Array.isArray(condition.else)) {
            condition.else = '';
            condition.optionalElse = null
          }
          break
      }
    }
    return condition
  }

  const deleteHandle = () => {
    console.log(path)
    if(path.length > 1) {
      const tempTemplate = JSON.parse(localStorage.tempTemplate) as templateType
      const newCondition = deleteCondition(path.slice(1), tempTemplate.conditions[+path[0]])
      setData(prevState => {
        const newState = {
          ...tempTemplate,
          conditions: tempTemplate.conditions.splice(+path[0], 1, newCondition)
        }

        localStorage.setItem('tempTemplate', JSON.stringify({...newState}))

        return newState
      })
    } else {
      setData(prevState => {
        const newState = {
          ...prevState,
          conditions: [...prevState.conditions.slice(0, +path[0]), ...prevState.conditions.slice(+path[0] + 1)]
        }
        console.log(newState)
        localStorage.setItem('tempTemplate', JSON.stringify({...newState}))

        return newState
      })
    }
  }

  return(

    <>
      <blockquote className={s.blockquote}>
        {tab && <span className={s.tab}/>}
        <div className={`${s.tabulation}`}>
          <span
            className="material-symbols-outlined"
            onClick={deleteHandle}
          >
            close
          </span>
          <span className={s.divider}></span>
        </div>
        <div className={s.container}>
        {
          Object.entries(newCondition as IfThenElse).map(([key, value], index) => (
            <React.Fragment key={uuid4()}>
              {getRow(key, value, index)}
            </React.Fragment>
          ))
        }
        </div>
      </blockquote>
    </>
  )
}

export default Condition
