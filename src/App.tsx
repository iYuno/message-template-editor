import React, {useContext, useState} from 'react';
import './App.css';
import TemplateEditor from "./components/templateEditor";
import ConditionContextProvider, {ConditionContext, da} from "./contexts/conditionContext";
import {ConditionContextStateType, templateType} from "./utils/types";



function App() {

  const [modal, setModal] = useState(true);
  const [edit, setEdit] = useState(modal);
  const [data, setData] = useContext(ConditionContext) as ConditionContextStateType

  const animationHandler = () => {
    if(modal !== edit) {
      setModal(edit)
    }
  }

  const nextHandler = () => {
    setEdit(prevState => !prevState)
    const template = localStorage.template
    if(!template) {
      localStorage.setItem('template', JSON.stringify(data))
      localStorage.setItem('tempTemplate', JSON.stringify(data))
    } else {
      localStorage.setItem('tempTemplate', template)
      const storedData = JSON.parse(template) as templateType
      setData(storedData)
    }
  }

  const closeHandler = () => {
    setEdit(prevState => !prevState)
  }

  const modalHandler = () => {
    setModal(true)
  }

  return (
    <>
      <div className={'container'}>
        {
          modal ?
            <button type={'button'} className={`button ${edit ? 'fade-in' : 'fade-out'}`}
                    onAnimationEnd={animationHandler} onClick={nextHandler}>
              message editor
            </button> :
            <TemplateEditor isActive={edit} activeHandler={closeHandler} modalHandler={modalHandler}/>
        }
      </div>
    </>
  );
}

export default App;
