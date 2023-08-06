import { SetStateAction, useEffect, useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import WanakanaInput from "./WanakanaInput";
import { useReviewQueue } from "../../hooks/useReviewQueue";
import { ReviewQueueItem } from "../../types/ReviewSessionTypes";
// import styled from "styled-components/macro";
import styled from "styled-components";

const InputRow = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

type AnswerInputProps = {
  inputcolor: string;
};

const AnswerInput = styled(WanakanaInput)<AnswerInputProps>`
  width: 100%;
  padding: 12px;
  text-align: center;
  font-size: 1.25rem;
  color: black;
  background-color: ${({ inputcolor }) => inputcolor};
`;

type Props = {
  currentReviewItem: ReviewQueueItem;
  userAnswer: string;
  setUserAnswer: (value: SetStateAction<string>) => void;
  nextBtnClicked: () => void;
  shakeInputTrigger: number;
};

function ReviewAnswerInput({
  currentReviewItem,
  userAnswer,
  setUserAnswer,
  nextBtnClicked,
  shakeInputTrigger,
}: Props) {
  const { queueState } = useReviewQueue();
  let reviewType = currentReviewItem.review_type;
  const inputRef = useRef<HTMLInputElement>();
  const [inputContainerRef, animate] = useAnimate();
  let inputColor = queueState.isSecondClick
    ? currentReviewItem.is_correct_answer
      ? "var(--ion-color-tertiary)"
      : "var(--ion-color-danger)"
    : "var(--offwhite-color)";

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    if (shakeInputTrigger) {
      animate(inputContainerRef.current, {
        x: [-5, 5, -5, 5, -5, 5, -5, 5, -5, 5, -5, 5, 0],
        transition: {
          duration: 0.5,
        },
      });
    }
  }, [shakeInputTrigger]);

  return (
    <InputRow ref={inputContainerRef}>
      <AnswerInput
        inputcolor={inputColor}
        inputRef={inputRef}
        type="text"
        value={userAnswer}
        onKeyDown={(e: any) => {
          if (e.key === "Enter") {
            nextBtnClicked();
          }
        }}
        translateToHiragana={reviewType === "reading"}
        onChange={(e: any) => setUserAnswer(e.target.value)}
        disabled={queueState.isSecondClick}
        placeholder={reviewType === "reading" ? "答え" : ""}
      />
    </InputRow>
  );
}

export default ReviewAnswerInput;
