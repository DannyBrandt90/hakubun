import { useEffect } from "react";
import {
  calculateSRSLevel,
  checkIfReviewIsComplete,
  isUserAnswerCorrect,
} from "../../services/AssignmentQueueService";
import {
  capitalizeWord,
  getAudioForReading,
  getSrsNameBySrsLvl,
  playAudioForAssignmentQueueItem,
} from "../../services/MiscService";
import { useQueueStore } from "../../stores/useQueueStore";
import { useAssignmentQueueStore } from "../../stores/useAssignmentQueueStore";
import { AssignmentQueueItem } from "../../types/AssignmentQueueTypes";
import { AssignmentQueueCard } from "./AssignmentQueueCard";
import { AssignmentCardContainer } from "./AssignmentQueueCardsStyled";

type Props = {
  submitItems: (reviewData: AssignmentQueueItem[]) => void;
};

function AssignmentQueueCards({ submitItems }: Props) {
  const showPopoverMsg = useQueueStore.use.showPopoverMsg();
  const correctShowResult = useQueueStore.use.correctShowResult();
  const correctMoveToNext = useQueueStore.use.correctMoveToNext();
  const wrongMoveToNext = useQueueStore.use.wrongMoveToNext();
  const wrongShowResult = useQueueStore.use.wrongShowResult();
  const isSecondClick = useQueueStore.use.isSecondClick();
  const submitChoice = useQueueStore.use.submitChoice();
  const retryReview = useQueueStore.use.retryReview();

  const assignmentQueue = useAssignmentQueueStore.use.assignmentQueue();
  let currQueueIndex = useAssignmentQueueStore.use.currQueueIndex();
  let updateItem = useAssignmentQueueStore.use.updateQueueItem();
  let incrementQueueIndex =
    useAssignmentQueueStore.use.incrementCurrQueueIndex();
  const addItemToQueue = useAssignmentQueueStore.use.addToAssignmentQueue();
  const removeOldItemFromQueue =
    useAssignmentQueueStore.use.removeOldQueueItem();

  useEffect(() => {
    if (
      currQueueIndex === assignmentQueue.length &&
      assignmentQueue.length !== 0
    ) {
      submitItems(assignmentQueue);
    }
  }, [assignmentQueue[currQueueIndex]]);

  const displaySRSStatus = (reviewItem: AssignmentQueueItem) => {
    let endingSRS = reviewItem.ending_srs_stage!;

    let hasIncreased = endingSRS > reviewItem.srs_stage;
    let endingSRSName = capitalizeWord(getSrsNameBySrsLvl(endingSRS));

    // TODO: change to use more specific types that display up or down arrows based on correct/incorrect
    let popoverToDisplay = hasIncreased
      ? ({
          message: `Increasing to ${endingSRSName}...`,
          messageType: "correct",
        } as const)
      : ({
          message: `Decreasing to ${endingSRSName}...`,
          messageType: "incorrect",
        } as const);

    showPopoverMsg(popoverToDisplay);
  };

  const displayInvalidAnswerMsg = (message: string) => {
    showPopoverMsg({ message, messageType: "invalid" });
  };

  const playAudioIfReadingAndAvailable = (
    assignmentQueueItem: AssignmentQueueItem,
    userAnswer: string
  ) => {
    if (
      (assignmentQueueItem.review_type === "reading" &&
        assignmentQueueItem.object === "vocabulary") ||
      (assignmentQueueItem.object === "kana_vocabulary" &&
        assignmentQueueItem.pronunciation_audios !== undefined)
    ) {
      const primaryReadingMap: { [index: string]: string | undefined } = {
        vocabulary: assignmentQueueItem.readings?.find(
          (reading: any) => reading.primary === true
        )?.reading,
        kana_vocabulary: assignmentQueueItem.characters || undefined,
      };

      let primaryReading =
        primaryReadingMap[assignmentQueueItem.object as string];

      let userAnswerReadingOrPrimaryFallback = getAudioForReading(
        assignmentQueueItem.pronunciation_audios!,
        userAnswer,
        primaryReading
      );

      playAudioForAssignmentQueueItem(userAnswerReadingOrPrimaryFallback);
    }
  };

  const handleCorrectAnswer = (
    currReviewItem: AssignmentQueueItem,
    setUserAnswer: (value: string) => void,
    moveToNextItem: boolean,
    userAnswer: string
  ) => {
    if (moveToNextItem) {
      correctMoveToNext();

      incrementQueueIndex();
      setUserAnswer("");
    } else {
      correctFirstClick(currReviewItem, userAnswer);
    }
  };

  const handleWrongAnswer = (
    currReviewItem: AssignmentQueueItem,
    setUserAnswer: (value: string) => void,
    moveToNextItem: boolean
  ) => {
    let updatedReviewItem = currReviewItem;

    if (moveToNextItem) {
      addItemToQueue(updatedReviewItem);
      removeOldItemFromQueue();
      wrongMoveToNext();
      setUserAnswer("");
    } else {
      showPopoverMsg({ message: "SRRY, WRONG :(", messageType: "incorrect" });
      updatedReviewItem.is_correct_answer = false;
      updatedReviewItem.is_reviewed = false;

      updatedReviewItem.review_type === "reading"
        ? (updatedReviewItem.incorrect_reading_answers += 1)
        : (updatedReviewItem.incorrect_meaning_answers += 1);

      updateItem(updatedReviewItem);
      wrongShowResult();
    }
  };

  const correctFirstClick = (
    currReviewItem: AssignmentQueueItem,
    userAnswer: string
  ) => {
    playAudioIfReadingAndAvailable(currReviewItem, userAnswer);

    let isReviewItemComplete = checkIfReviewIsComplete(
      currReviewItem,
      assignmentQueue
    );

    let updatedReviewItem = currReviewItem;
    showPopoverMsg({ message: "CORRECT!", messageType: "correct" });

    if (isReviewItemComplete) {
      updatedReviewItem = calculateSRSLevel(assignmentQueue, updatedReviewItem);

      displaySRSStatus(updatedReviewItem);
    }

    let wasWrongFirstAttempt = updatedReviewItem.is_reviewed;
    if (wasWrongFirstAttempt) {
      // keeping answer as incorrect and is_reviewed as true
      updatedReviewItem.is_reviewed = true;

      updateItem(updatedReviewItem);
    }

    // user got answer correct first try
    else {
      updatedReviewItem.is_correct_answer = true;
      updatedReviewItem.is_reviewed = true;
      updateItem(updatedReviewItem);
    }

    correctShowResult();
  };

  const handleNextClick = (
    currReviewItem: AssignmentQueueItem,
    userAnswer: string,
    setUserAnswer: (value: string) => void
  ) => {
    // *testing
    console.log(
      "🚀 ~ file: ReviewSession.tsx:137 ~ ReviewSession ~ userAnswer:",
      userAnswer
    );
    // *testing
    let isCorrectAnswer = isUserAnswerCorrect(currReviewItem, userAnswer);

    let moveToNextItem = isSecondClick;
    isCorrectAnswer
      ? handleCorrectAnswer(
          currReviewItem,
          setUserAnswer,
          moveToNextItem,
          userAnswer
        )
      : handleWrongAnswer(currReviewItem, setUserAnswer, moveToNextItem);

    submitChoice();
  };

  const handleRetryClick = (
    currReviewItem: AssignmentQueueItem,
    setUserAnswer: (value: string) => void
  ) => {
    let updatedReviewItem = currReviewItem;
    updatedReviewItem.is_correct_answer = null;
    updatedReviewItem.is_reviewed = false;
    // undoing the increment previously done
    updatedReviewItem.review_type === "reading"
      ? (updatedReviewItem.incorrect_reading_answers -= 1)
      : (updatedReviewItem.incorrect_meaning_answers -= 1);

    updateItem(updatedReviewItem);
    setUserAnswer("");
    retryReview();
  };

  return (
    <>
      {assignmentQueue.length === 0 ||
      currQueueIndex === assignmentQueue.length ? (
        <p>Loading...</p>
      ) : (
        <AssignmentCardContainer>
          <AssignmentQueueCard
            currentReviewItem={assignmentQueue[currQueueIndex]}
            displayInvalidAnswerMsg={displayInvalidAnswerMsg}
            handleNextClick={handleNextClick}
            handleRetryClick={handleRetryClick}
          />
        </AssignmentCardContainer>
      )}
    </>
  );
}

export default AssignmentQueueCards;