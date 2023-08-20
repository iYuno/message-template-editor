import {FC, useContext} from "react";
import s from './footer.module.css'
import {ConditionContext, da} from "../../contexts/conditionContext";
import {ConditionContextStateType, templateType} from "../../utils/types";

interface IFooter {
  previewHandler: () => void,
  activeHandler: () => void
}

const Footer: FC<IFooter> = ({previewHandler, activeHandler}) => {

  const [data] = useContext(ConditionContext) as ConditionContextStateType

  const saveHandler = () => {
    localStorage.template = localStorage.tempTemplate
    activeHandler()
  }

  return(
    <footer className={s.footer}>
      <button type={'button'} className={s.btn} onClick={previewHandler}>
        <p>preview</p>
      </button>
      <button type={'button'} className={s.btn} onClick={saveHandler}>
        <p>save & close</p>
      </button>
      <button type={'button'} className={s.btn} onClick={activeHandler}>
        <p>close without saving</p>
      </button>
    </footer>
  )
}

export default Footer
