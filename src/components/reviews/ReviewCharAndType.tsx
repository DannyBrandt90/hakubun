import { IonCol, IonRow } from "@ionic/react";
import { SubjectType } from "../../types/Subject";
import {
  PopoverInfo,
  PopoverMessageType,
} from "../../reducers/reviewSessionReducer";
import {
  getReviewTypeColor,
  getSubjectColor,
  getSubjectTypeDisplayText,
} from "../../services/SubjectAndAssignmentService";
import { SubjectChars } from "../SubjectChars";

import styled from "styled-components/macro";
import { ReviewQueueItem, ReviewType } from "../../types/MiscTypes";
import { capitalizeWord, getPopoverMsgColor } from "../../services/MiscService";

type ReviewTypeProps = {
  reviewType: ReviewType;
};

const ReviewTypeRow = styled(IonRow)<ReviewTypeProps>`
  justify-content: center;
  background-color: ${({ reviewType }) => getReviewTypeColor(reviewType)};
  --ion-background-color: ${({ reviewType }) => getReviewTypeColor(reviewType)};

  p {
    font-size: 1.125rem;
    margin: 10px;
  }
`;

const SubjectCharRow = styled(IonRow)`
  position: relative;
  justify-content: center;
`;

type MsgWrapperProps = {
  displayMsg: boolean;
};

const MessageWrapper = styled.div<MsgWrapperProps>`
  justify-content: center;
  align-items: center;
  position: absolute;
  display: ${({ displayMsg }) => (displayMsg ? `flex` : `none`)};
  bottom: 1rem;
`;

type MessageProps = {
  messageType: PopoverMessageType;
};

const Message = styled.span<MessageProps>`
  display: inline-block;
  min-width: 1em;
  padding: 10px;
  border-radius: 15px;
  font-size: 1rem;
  text-align: center;
  background-color: ${({ messageType }) => getPopoverMsgColor(messageType)};
  color: #fefefe;
`;

type ReviewMessageProps = {
  displayMsg: boolean;
  popoverInfo: PopoverInfo;
};

const ReviewMessage = ({ displayMsg, popoverInfo }: ReviewMessageProps) => {
  return (
    <MessageWrapper displayMsg={displayMsg}>
      <Message messageType={popoverInfo.messageType}>
        {popoverInfo.message}
      </Message>
    </MessageWrapper>
  );
};

type CharColProps = {
  subjType: SubjectType;
};

const SubjectCharactersCol = styled(IonCol)<CharColProps>`
  padding: 50px 0;
  padding-bottom: 65px;
  background-color: ${({ subjType }) => getSubjectColor(subjType)};
`;

type Props = {
  reviewQueue: ReviewQueueItem[];
  currReviewCardIndex: number;
  showReviewMsg: boolean;
  popoverInfo: PopoverInfo;
};

export const ReviewCharAndType = ({
  reviewQueue,
  currReviewCardIndex,
  showReviewMsg,
  popoverInfo,
}: Props) => {
  const currentReviewItem = reviewQueue[currReviewCardIndex];
  let subjType = currentReviewItem.object as SubjectType;
  let reviewType = currentReviewItem.review_type;
  let reviewTypeCapitalized = capitalizeWord(reviewType);
  let reviewDisplayTxt = getSubjectTypeDisplayText(
    currentReviewItem.object,
    false
  );

  return (
    <>
      <SubjectCharRow>
        <SubjectCharactersCol subjType={subjType}>
          <SubjectChars
            subject={currentReviewItem}
            fontSize="4rem"
            withBgColor={true}
          />
        </SubjectCharactersCol>
        <ReviewMessage displayMsg={showReviewMsg} popoverInfo={popoverInfo} />
      </SubjectCharRow>
      <ReviewTypeRow reviewType={reviewType}>
        <p>
          {reviewDisplayTxt} {reviewTypeCapitalized}
        </p>
      </ReviewTypeRow>
    </>
  );
};