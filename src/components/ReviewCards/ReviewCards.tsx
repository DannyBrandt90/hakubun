import { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  motion,
  useMotionValue,
  useTransform,
  useWillChange,
  useAnimate,
} from "framer-motion";
import { toHiragana } from "wanakana";

import RetryIcon from "../../images/retry.svg";
import NextIcon from "../../images/next-item.svg";
import styled from "styled-components/macro";
import { SubjectType } from "../../types/Subject";
import { ReviewQueueItem } from "../../types/ReviewSessionTypes";
import { useKeyDown } from "../../hooks/useKeyDown";
import {
  isUserAnswerValid,
  getSubjectColor,
} from "../../services/SubjectAndAssignmentService";
import ReviewCharAndType from "./ReviewCharAndType";
import ReviewAnswerInput from "./ReviewAnswerInput";
import ReviewItemBottomSheet from "../ReviewItemBottomSheet";
import { useReviewQueue } from "../../hooks/useReviewQueue";

const TestReviewCardContainer = styled(motion.div)`
  border-radius: 10px;
  margin: 10px;
  display: flex;
  max-width: 1400px;
  will-change: "transform";
  touch-action: none;
`;

type ReviewItemProps = {
  subjtype: SubjectType;
};

const ReviewCard = styled(motion.div)<ReviewItemProps>`
  position: relative;
  padding: 50px 0 100px 0;
  border-radius: 10px;
  width: 100%;
  background-color: ${({ subjtype }) => {
    return getSubjectColor(subjtype);
  }};
  will-change: "transform";
  cursor: grab;
  touch-action: none;
`;

const SwipeOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  border-radius: 10px;
  pointer-events: none;
  flex-grow: 1;
  touch-action: none;
  opacity: 0;
`;

const SwipeIcon = styled(motion.div)`
  position: absolute;
  padding: 20px;
  border-radius: 50%;

  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ion-icon {
    width: 85px;
    height: 85px;
  }
`;

const NextCardOverlay = styled(SwipeOverlay)`
  background-color: var(--ion-color-tertiary);

  div {
    color: black;
    border: 2px solid black;
  }
`;

const RetryCardOverlay = styled(SwipeOverlay)`
  background-color: var(--ion-color-secondary);
  div {
    color: white;
    border: 2px solid white;
  }
`;

type CardProps = {
  currentReviewItem: ReviewQueueItem;
};

const Card = ({ currentReviewItem }: CardProps) => {
  const [userAnswer, setUserAnswer] = useState("");
  useKeyDown(() => attemptToAdvance(), ["F12"]);
  useKeyDown(() => retryTriggered(), ["F6"]);
  const {
    handleNextClick,
    handleRetryClick,
    queueState,
    displayInvalidAnswerMsg,
  } = useReviewQueue();
  const x = useMotionValue(0);
  const [reviewCardRef, animateCard] = useAnimate();

  const exitTimeMs = 500;
  const exitTimeDecimal = (exitTimeMs / 1000).toFixed(1) as unknown as number;
  const opacityLeft = useTransform(x, [-100, 0], [1, 0]);
  const opacityRight = useTransform(x, [0, 100], [0, 1]);
  const willChange = useWillChange();

  const rotate = useTransform(x, [-300, 0, 300], [-20, 0, 20]);

  const retryTriggered = () => {
    setTimeout(() => {
      x.set(0);
      handleRetryClick(currentReviewItem, setUserAnswer);
    }, exitTimeMs);
  };

  const attemptToAdvance = () => {
    currentReviewItem.review_type === "reading" &&
      setUserAnswer(toHiragana(userAnswer));

    let isValidInfo = isUserAnswerValid(currentReviewItem, userAnswer);
    if (isValidInfo.isValid === false) {
      displayInvalidAnswerMsg(isValidInfo.message);
    } else {
      animateCard(
        reviewCardRef.current,
        { x: "150%" },
        { duration: exitTimeDecimal }
      );

      setTimeout(() => {
        x.set(0);
        handleNextClick(currentReviewItem, userAnswer, setUserAnswer);
      }, exitTimeMs);
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent, info: any) => {
    if (info.offset.x > 200) {
      attemptToAdvance();
    } else if (info.offset.x < -200) {
      if (queueState.showRetryButton) {
        retryTriggered();
      } else {
        // TODO: show some visual indication of this
        console.log("RETRY NOT AVAILABLE!");
      }
    }
  };

  return (
    <ReviewCard
      ref={reviewCardRef}
      subjtype={currentReviewItem.object as SubjectType}
      initial={{ y: "-150%" }}
      style={{
        x,
        rotate,
        willChange,
      }}
      drag="x"
      animate={{ y: 0 }}
      transition={{ type: "spring", duration: 1, bounce: 0.5 }}
      dragSnapToOrigin={true}
      dragConstraints={{ left: 0, right: 0 }}
      dragTransition={{ bounceStiffness: 400, bounceDamping: 20 }}
      onDragEnd={handleDragEnd}
      dragDirectionLock={true}
      whileTap={{ cursor: "grabbing" }}
      dragElastic={0.5}
    >
      <ReviewCharAndType currentReviewItem={currentReviewItem} />
      <ReviewAnswerInput
        currentReviewItem={currentReviewItem}
        userAnswer={userAnswer}
        setUserAnswer={setUserAnswer}
        nextBtnClicked={attemptToAdvance}
      />
      <ReviewItemBottomSheet
        currentReviewItem={currentReviewItem}
        reviewType={currentReviewItem.review_type}
      />
      <RetryCardOverlay
        style={{
          opacity: opacityLeft,
        }}
      >
        <SwipeIcon>
          <IonIcon icon={RetryIcon}></IonIcon>
        </SwipeIcon>
      </RetryCardOverlay>
      <NextCardOverlay
        style={{
          opacity: opacityRight,
        }}
      >
        <SwipeIcon>
          <IonIcon icon={NextIcon}></IonIcon>
        </SwipeIcon>
      </NextCardOverlay>
    </ReviewCard>
  );
};

type Props = {
  currentReviewItem: ReviewQueueItem;
};

function ReviewCards({ currentReviewItem }: Props) {
  return (
    <TestReviewCardContainer>
      <Card
        key={currentReviewItem.itemID}
        currentReviewItem={currentReviewItem}
      />
    </TestReviewCardContainer>
  );
}

export default ReviewCards;