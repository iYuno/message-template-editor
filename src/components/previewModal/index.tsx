import React, {ChangeEvent, FC, useContext, useEffect, useMemo, useState} from "react";
import s from './previewModal.module.css'
import {arrVars} from "../../utils/consts";
import {v4 as uuid4} from "uuid";
import TextareaAutosize from "react-textarea-autosize";
import {CurrentInputContext} from "../../contexts/currentInputContext";
import {ConditionContextStateType, CurrentInputStateType, IfThenElse, variablesType} from "../../utils/types";
import {ConditionContext, da} from "../../contexts/conditionContext";

interface IPreviewModal {
  modalHandler: () => void
}

let debounceTimer: NodeJS.Timeout;

const PreviewModal: FC<IPreviewModal> = ({modalHandler}) => {

  const [varNames, setVarNames] = useState<variablesType>({firstName: null, company: null, lastName: null, position: null} as variablesType)
  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType
  const [currentInput, setCurrentInput] = useContext(CurrentInputContext) as CurrentInputStateType
  const [messagePreview, setMessagePreview] = useState('')

  const varsHandler = (event: ChangeEvent<HTMLTextAreaElement>, value: string) => {
    const newText = event.target.value

    clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      setVarNames(prevState => ({...prevState, [value as keyof typeof varNames]: newText.trim()}))
    }, 250)

  }

  const messageHandler = (condition: IfThenElse) => {
    const match = condition.if.trim().match(/\{(.*?)\}/)

    if(match && match[1] && varNames[match[1] as keyof typeof varNames]) {
      switch (typeof condition.then) {
        case 'string':
          setMessagePreview(prevState => prevState + condition.then)
          break
        case 'object':
          if(condition.optionalThen) {
            setMessagePreview(prevState => prevState + condition.optionalThen)
          }
          condition.then.map((c, index) => {
            messageHandler(c)
            if(c.optionalText) {
              setMessagePreview(prevState => prevState + c.optionalText)
            }
          })
          break
      }
    } else {
      switch (typeof condition.else) {
        case 'string':
          setMessagePreview(prevState => prevState + condition.else)
          break
        case 'object':
          if(condition.optionalElse) {
            setMessagePreview(prevState => prevState + condition.optionalElse)
          }
          condition.else.map((c, index) => {
            messageHandler(c)
            if(c.optionalText) {
              setMessagePreview(prevState => prevState + c.optionalText)
            }
          })
          break
      }
    }
  }

  useEffect(() => {

    setMessagePreview(data.topText)

    data.conditions.map((condition) => {
      messageHandler(condition)
      if(condition.optionalText) {
        setMessagePreview(prevState => prevState + condition.optionalText)
      }
    })

    setMessagePreview(prevState => prevState + data.bottomText)

    setMessagePreview(prevState => {
      return prevState.replace(/\{([^{}]+)\}/g, (match) => {
        console.log(match.slice(1, -1))
        if(varNames.hasOwnProperty(match.slice(1, -1))) {
          return `${varNames[match.slice(1, -1) as keyof typeof varNames] !== null ? varNames[match.slice(1, -1) as keyof typeof varNames] : ''}`;
        } else {
          return match
        }
      })
    })

  }, [varNames])

  return(
    <>
      <div className={s.darkBG} onClick={modalHandler}/>
      <div className={s.centered}>
        <div className={s.modal}>
          <div className={s.wrapper}>
            <div className={s.modalHeader}>
              <p>message template</p>
            </div>
            <pre className={s.message}>
              {messagePreview}
            </pre>
          </div>
          <div className={s.wrapper}>
            <div className={s.modalHeader}>
              <div className={s.text}><p>variables</p></div>
              <div className={s.closeIcon}>
                <span
                  className="material-symbols-outlined"
                  onClick={modalHandler}
                >
                close
              </span>
              </div>
            </div>
            <ul className={s.vars__list}>
              {
                arrVars.map((value, index) => (
                  <li key={uuid4()} className={s.vars__list_item}>
                    <p>{value}</p>
                    <div
                      className={s.input_container}
                      onClick={() => {
                        if(currentInput[0] !== value) setCurrentInput([value])
                      }}
                    >
                      <TextareaAutosize
                        onChange={(event) => {
                          varsHandler(event, value.slice(1, value.length - 1))
                          localStorage.setItem('cursor', event.target.selectionStart.toString())
                        }}
                        onFocus={(event) => {
                          if(currentInput[0] !== value) {
                            setCurrentInput([value])
                          }
                          event.target.selectionStart = localStorage.cursor ? +localStorage.cursor : 0
                        }}
                        onClick={(event) => localStorage.setItem('cursor', event.currentTarget.selectionStart.toString())}
                        onKeyUp={(event) => {
                          const newCursor = event.currentTarget.selectionStart
                          localStorage.setItem('cursor', newCursor.toString())
                        }}
                        autoFocus={currentInput[0] === value}
                        defaultValue={varNames[value.slice(1, value.length - 1) as keyof typeof varNames] || ''}
                        className={s.textArea}
                        maxRows={1}
                        maxLength={40}
                      />
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}

export default PreviewModal
