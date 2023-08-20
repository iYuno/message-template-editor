import {ChangeEvent, FC, useContext, useRef, useState, MouseEvent, memo, useEffect} from "react";
import s from './textArea.module.css'
import conditionContext, {ConditionContext, da} from "../../contexts/conditionContext";
import {ConditionContextStateType, CurrentInputStateType, IfThenElse, templateType} from "../../utils/types";
import condition from "../condition";
import {CurrentInputContext} from "../../contexts/currentInputContext";
import TextareaAutosize from 'react-textarea-autosize';
import {v4 as uuid4} from "uuid";

interface ITextArea {
  isRequired: boolean,
  isCondition: boolean,
  value: string,
  path: string[],
}

let debounceTimer: NodeJS.Timeout;

const TextArea: FC<ITextArea> = ({isRequired, isCondition, value, path}) => {

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const divRef = useRef(null)
  const [text, setText] = useState<string>(value);
  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType
  const [currentInput, setCurrentInput] = useContext(CurrentInputContext) as CurrentInputStateType
  const [isCollapse, setIsCollapse] = useState<boolean>(JSON.stringify(path) !== JSON.stringify(currentInput))

  useEffect(() => {
    setText(value)
  }, [value])


  const changeStateHandler = (newPath: string[], condition: IfThenElse, newText?: string) => {
    if(newPath.length - 1) {
      Object.entries(condition).forEach(([key, value], index) => {
        if(key === newPath[0]) {
          switch (typeof value) {
            case 'string':
              break
            case 'object':
              if(Array.isArray(value)) {
                changeStateHandler(newPath.slice(2), value[+newPath[1]], newText)
              } else if(value) {
                changeStateHandler(newPath.slice(1), value, newText)
              }
          }
        }
      })
    } else {
        condition[newPath[0] as keyof typeof condition] = newText ? newText : ''
    }
    return condition
  }
  const textHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
    let newText = event.target.value
    setText(newText)

    clearTimeout(debounceTimer)

    debounceTimer = setTimeout(() => {
      const tempTemplate = JSON.parse(localStorage.tempTemplate) as templateType
      if(!(path[0] === 'top' || path[0] === 'bottom')) {
        setData(prevState => {
          const newState = {...prevState, conditions: prevState.conditions.splice(+path[0], 1, changeStateHandler(path.slice(1), prevState.conditions[+path[0]], newText))}
          localStorage.setItem('tempTemplate', JSON.stringify(newState))
          return newState
        })

        localStorage.setItem('tempTemplate', JSON.stringify({...tempTemplate, conditions: tempTemplate.conditions.splice(+path[0], 1, changeStateHandler(path.slice(1), tempTemplate.conditions[+path[0]], newText))}))
      } else {
        switch (path[0]) {
          case 'top':
            setData(prevState => {
              const newState = {...prevState, topText: newText} as templateType
              localStorage.setItem('tempTemplate', JSON.stringify(newState))
              return newState
            })
            break
          case 'bottom':
            setData(prevState => {
              const newState = {...prevState, bottomText: newText} as templateType
              localStorage.setItem('tempTemplate', JSON.stringify(newState))
              return newState
            })
            break
        }
      }
    }, 250)
  }

  const updateCondition = (newPath: string[], condition: IfThenElse) => {
    if(newPath.length - 1) {
      Object.entries(condition).forEach(([key, value], index) => {
        if(key === newPath[0]) {
          switch (typeof value) {
            case 'string':
              break
            case 'object':
              if(Array.isArray(value)) {
                updateCondition(newPath.slice(2), value[+newPath[1]])
              } else if(value) {
                updateCondition(newPath.slice(1), value)
              }
          }
        }
      })
    } else {
      switch (newPath[0]) {
        case 'optionalThen':
          condition.then = [...condition.then as IfThenElse[], {if: '', optionalThen: null, then: '', optionalElse: null, else: '', optionalText: ''}] as IfThenElse[];
          break
        case 'then':
          condition.optionalThen = ''
          condition.then = [{if: '', optionalThen: null, then: '', optionalElse: null, else: '', optionalText: ''}] as IfThenElse[];
          break
        case 'optionalElse':
          condition.else = [...condition.else as IfThenElse[], {if: '', optionalThen: null, then: '', optionalElse: null, else: '', optionalText: ''}] as IfThenElse[];
          break
        case 'else':
          condition.optionalElse = ''
          condition.else = [{if: '', optionalThen: null, then: '', optionalElse: null, else: '', optionalText: ''}] as IfThenElse[];
          break
      }
    }
    return condition as IfThenElse
  }
  const newConditionHandler = () => {
    const newCondition = updateCondition(path.slice(1), data.conditions[+path[0]])
    setData(prevState => {
      const newState = {
        ...prevState,
        conditions: prevState.conditions.splice(+path[0], 1, newCondition)
      }

      localStorage.setItem('tempTemplate', JSON.stringify(newState))
      return newState
    })
  }

  return(
    <div
      className={s.container}
      onClick={(event) => {
        if(isCollapse) {
          setIsCollapse(false)
          setCurrentInput(prevState => path)
        }
      }}
      onBlur={() => {
        setTimeout(() => {
          setIsCollapse(true)
        }, 100)
      }}
    >
      <TextareaAutosize
        style={{resize: "none"}}
        maxLength={300}
        autoFocus={JSON.stringify(path) === JSON.stringify(currentInput)}
        onFocus={(event) => {
          event.target.selectionStart = localStorage.cursor ? +localStorage.cursor : 0
        }}
        onClick={(event) => localStorage.setItem('cursor', event.currentTarget.selectionStart.toString())}
        onKeyUp={(event) => {
          const newCursor = event.currentTarget.selectionEnd
          localStorage.setItem('cursor', newCursor.toString())
        }}
        onChange={textHandler}
        value={text}
        ref={inputRef}
        className={s.inputArea}
        placeholder={`${isRequired ? 'Require' : 'Optional text'}`}
      />
      {
        isCondition && !isCollapse &&
          <div
            id={path.toString()}
            className={s.detailsInput}
          >
            <span className={s.divider}></span>
            <div className={s.condition}>
              <button
                  className={s.addCondition}
                  type={'button'}
                  onClick={newConditionHandler}
              >
                <p>if | then | else</p>
              </button>
            </div>
          </div>
      }
    </div>
  )
}

export default TextArea
