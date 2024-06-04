import { FC, useEffect, useState } from "react";

// Third party imports
import {
  QuestionStage,
  QuestionType,
  Statement,
  StatementType,
  User,
  isOptionFn,
} from "delib-npm";
import { useParams, useNavigate } from "react-router";

// Utils & Helpers
import {
  getMultiStageOptions,
  sortSubStatements,
} from "./statementSolutionsCont";

// Custom Components
import StatementEvaluationCard from "./components/StatementEvaluationCard";
import CreateStatementModal from "../createStatementModal/CreateStatementModal";
import StatementBottomNav from "../nav/bottom/StatementBottomNav";
import { useAppDispatch } from "../../../../../controllers/hooks/reduxHooks";
import Toast from "../../../../components/toast/Toast";
import { stages } from "../settings/components/QuestionSettings/QuestionStageRadioBtn/QuestionStageRadioBtn";
import Modal from "../../../../components/modal/Modal";
import StatementInfo from "../vote/components/info/StatementInfo";
import Button from "../../../../components/buttons/button/Button";
import LightBulbIcon from "../../../../../assets/icons/lightBulbIcon.svg?react";
import X from "../../../../../assets/icons/x.svg?react";
import { useLanguage } from "../../../../../controllers/hooks/useLanguages";

interface StatementEvaluationPageProps {
  statement: Statement;
  subStatements: Statement[];
  handleShowTalker: (talker: User | null) => void;
  showNav?: boolean;
  questions?: boolean;
  toggleAskNotifications: () => void;
}

const StatementEvaluationPage: FC<StatementEvaluationPageProps> = ({
  statement,
  subStatements,
  handleShowTalker,
  questions = false,
  toggleAskNotifications,
}) => {
  try {
    // Hooks
    const { sort } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const {t} = useLanguage();

    const isMuliStage =
      statement.questionSettings?.questionType === QuestionType.multipleSteps;
    const currentStage = statement.questionSettings?.currentStage;

    // Use States
    const [showModal, setShowModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showExplanation, setShowExplanation] = useState(
      currentStage === QuestionStage.explanation && isMuliStage && !questions
    );
    const [sortedSubStatements, setSortedSubStatements] = useState<Statement[]>(
      [...subStatements]
    );

    useEffect(() => {
      const _sortedSubStatements = sortSubStatements(
        subStatements,
        sort
      ).filter((subStatement) => {
        //if questions is true, only show questions
        if (questions) {
          return subStatement.statementType === StatementType.question;
        }

        if (isMuliStage) {
          return subStatement.isPartOfTempPresentation;
        }

        //if options is true, only show options
        return isOptionFn(subStatement);
      });

      setSortedSubStatements(_sortedSubStatements);
    }, [sort, subStatements, questions]);

    useEffect(() => {
      if (questions) {
        setShowToast(false);
      }
    }, [questions]);

    useEffect(() => {
      if (isMuliStage) {
        getMultiStageOptions(statement, dispatch);
      }
    }, [isMuliStage]);

    useEffect(() => {
      if (!showToast && !questions) {
        setShowToast(true);
      }
      if (
        currentStage === QuestionStage.explanation &&
        isMuliStage &&
        !questions
      ) {
        setShowExplanation(true);
      }
      if (currentStage === QuestionStage.voting && !questions) {
        //redirect us react router dom to voting page
        navigate(`/statement/${statement.statementId}/vote`);
      }
    }, [statement.questionSettings?.currentStage, questions]);

    // Variables
    let topSum = 30;
    const tops: number[] = [topSum];

    return (
      <>
        <div className="page__main">
          <div className="wrapper">
            {isMuliStage &&
              currentStage &&
              stages[currentStage] &&
              stages[currentStage].message && (
                <Toast
                  text={t(`${stages[currentStage].message}`)}
                  type="message"
                  show={showToast}
                  setShow={setShowToast}
                >
                  <Button
                    text={t("Close")}
                    iconOnRight={false}
                    onClick={() => {
                      setShowModal(true);
                      setShowToast(false);
                    }}
                    Icon={<X />}
                    color="var(--dark-blue)"
                  />
                  <Button
                    text={t("Add a solution")}
                    iconOnRight={true}
                    onClick={() => {
                      setShowToast(false);
                    }}
                    Icon={<LightBulbIcon />}
                    color="var(--dark-blue)"
                  />
                </Toast>
              )}
            {sortedSubStatements?.map((statementSub: Statement, i: number) => {
              //get the top of the element
              if (statementSub.elementHight) {
                topSum += statementSub.elementHight + 30;
                tops.push(topSum);
              }

              return (
                <StatementEvaluationCard
                  key={statementSub.statementId}
                  parentStatement={statement}
                  statement={statementSub}
                  showImage={handleShowTalker}
                  top={tops[i]}
                />
              );
            })}
            <div
              className="options__bottom"
              style={{ height: `${topSum + 70}px` }}
            ></div>
          </div>
        </div>

        <div className="page__footer">
          <StatementBottomNav
            setShowModal={setShowModal}
            statement={statement}
          />
        </div>
        {showExplanation && (
          <Modal>
            <StatementInfo
              statement={statement}
              setShowInfo={setShowExplanation}
            />
          </Modal>
        )}
        {showModal && (
          <CreateStatementModal
            parentStatement={statement}
            isOption={questions ? false : true}
            setShowModal={setShowModal}
            toggleAskNotifications={toggleAskNotifications}
          />
        )}
      </>
    );
  } catch (error) {
    console.error(error);

    return null;
  }
};

export default StatementEvaluationPage;
