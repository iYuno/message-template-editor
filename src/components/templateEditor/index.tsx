import {FC, useContext, useEffect, useState} from "react";
import s from './templateEditor.module.css'
import {arrVars,} from "../../utils/consts";
import TextArea from "../textArea";
import Condition from "../condition";
import {v4 as uuid4} from "uuid";
import React from "react";
import Footer from "../footer";
import {ConditionContextStateType, CurrentInputStateType, IfThenElse, templateType} from "../../utils/types";
import {ConditionContext} from "../../contexts/conditionContext";
import ConditionList from "../condition/conditionList";
import CurrentInputContextProvider, {CurrentInputContext} from "../../contexts/currentInputContext";
import PreviewModal from "../previewModal";


interface ITemplateEditor {
  isActive: boolean,
  activeHandler: () => void,
  modalHandler: () => void
}

let timeout: NodeJS.Timeout

const TemplateEditor: FC<ITemplateEditor> = ({isActive, activeHandler, modalHandler}) => {

  const [currentInput] = useContext(CurrentInputContext) as CurrentInputStateType
  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const changeStateHandler = (newPath: string[], condition: IfThenElse, newVariable?: string) => {
    if(newPath.length - 1) {
      Object.entries(condition).forEach(([key, value], index) => {
        if(key === newPath[0]) {
          switch (typeof value) {
            case 'string':
              break
            case 'object':
              if(Array.isArray(value)) {
                changeStateHandler(newPath.slice(2), value[+newPath[1]], newVariable)
              } else if(value) {
                changeStateHandler(newPath.slice(1), value, newVariable)
              }
          }
        }
      })
    } else if(newVariable) {
      const cursor = localStorage.getItem('cursor')
      const str = condition[newPath[0] as keyof typeof condition] as string

      if(cursor) {
        condition[newPath[0] as keyof typeof condition] = `${str.substring(0, +cursor)} ${newVariable} ${str.substring(+cursor + 1)}`
      } else {
        condition[newPath[0] as keyof typeof condition] = `${str} ${newVariable}`
      }
    }

    return condition
  }
  const addVariableHandler = (variable: string) => {
    const tempTemplate = JSON.parse(localStorage.tempTemplate) as templateType
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      if(!(currentInput[0] === 'top' || currentInput[0] === 'bottom')) {
        setData(prevState => {
          const newState = {
            ...prevState,
            conditions: prevState.conditions.splice(+currentInput[0], 1, changeStateHandler(currentInput.slice(1), data.conditions[+currentInput[0]], variable))
          }
          localStorage.setItem('tempTemplate', JSON.stringify(newState))

          return newState
        })
      } else {
        switch (currentInput[0]) {
          case 'top':
            setData(prevState => {
              const cursor = localStorage.getItem('cursor')
              if(cursor && cursor !== '0') {
                const newState = {
                  ...prevState,
                  topText: `${prevState.topText.substring(0, +cursor)} ${variable} ${prevState.topText.substring(+cursor + 1)}`
                }

                localStorage.setItem('tempTemplate', JSON.stringify(newState))
                return newState
              } else {
                const newState = {
                  ...prevState,
                  topText: `${prevState.topText} ${variable}`
                }
                localStorage.setItem('tempTemplate', JSON.stringify(newState))
                return newState
              }
            })
            break
          case 'bottom':
            setData(prevState => {
              const cursor = localStorage.getItem('cursor')
              if(cursor && cursor !== '0') {
                const newState = {
                  ...prevState,
                  bottomText: `${prevState.bottomText.substring(0, +cursor)} ${variable} ${prevState.bottomText.substring(+cursor + 1)}`
                }
                localStorage.setItem('tempTemplate', JSON.stringify(newState))
                return newState
              } else {
                const newState = {
                  ...prevState,
                  bottomText: `${prevState.bottomText} ${variable}`
                }
                localStorage.setItem('tempTemplate', JSON.stringify(newState))
                return newState
              }
            })
            break
        }
      }
    }, 50)
  }

  const previewOpenHandler = (state: boolean) => {
    if(state) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    setIsPreviewOpen(state)
  }


  return(
    <section
      className={`${s.template_modal} ${!isActive ? 'fade-in' : 'fade-out'}`}
      onAnimationEnd={() => {
        if(isActive) {
          modalHandler()
        }
      }}
    >
      <header className={s.head}>
        <h2>message template editor</h2>
      </header>

      <div className={s.vars}>
        <p>variables</p>
        <ul className={s.vars__list}>
          {arrVars.map((variable, index, array) => (
            <li className={s.vars__list_item} key={uuid4()} onClick={() => addVariableHandler(variable)}>
              <p>{variable}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={s.message_template}>
        <p>message template</p>
        <ConditionList/>
      </div>

      <Footer previewHandler={() => previewOpenHandler(true)} activeHandler={activeHandler}/>

      {
        isPreviewOpen &&
          <PreviewModal modalHandler={() => previewOpenHandler(false)}/>
      }
    </section>
  )
}

export default TemplateEditor;
